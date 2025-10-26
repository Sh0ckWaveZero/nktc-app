import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/apis/auth/auth.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    authService = moduleFixture.get<AuthService>(AuthService);

    // Apply global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });

    await prisma.$disconnect();
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
        });
    });

    it('should reject registration with invalid email', () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', false);
          expect(res.body).toHaveProperty('message', 'Validation failed');
          expect(res.body.errors).toContainEqual({
            field: 'email',
            message: 'Please provide a valid email address',
          });
        });
    });

    it('should reject registration with short password', () => {
      const userData = {
        email: 'test2@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
        role: 'User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', false);
          expect(res.body).toHaveProperty('message', 'Validation failed');
          expect(res.body.errors).toContainEqual({
            field: 'password',
            message: 'Password must be at least 6 characters long',
          });
        });
    });

    it('should reject registration with missing required fields', () => {
      const userData = {
        email: 'test3@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', false);
          expect(res.body).toHaveProperty('message', 'Validation failed');
        });
    });
  });

  describe('/auth/login (POST)', () => {
    let testUser: any;

    beforeAll(async () => {
      // Create a test user for login tests
      testUser = await authService.register({
        email: 'logintest@example.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'Test',
        role: 'User',
      });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('expiresIn');
        });
    });

    it('should reject login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject login with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', false);
          expect(res.body).toHaveProperty('message', 'Validation failed');
        });
    });
  });

  describe('/auth/me (GET)', () => {
    let validToken: string;

    beforeAll(async () => {
      // Create and login a user to get token
      await authService.register({
        email: 'metest@example.com',
        password: 'password123',
        firstName: 'Me',
        lastName: 'Test',
        role: 'User',
      });

      const loginResult = await authService.login(
        {
          email: 'metest@example.com',
          password: 'password123',
        },
        '',
      );

      validToken = loginResult.token;
    });

    it('should get current user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'metest@example.com');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
