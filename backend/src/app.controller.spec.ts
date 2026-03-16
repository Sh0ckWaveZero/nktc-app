import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './common/services/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health check', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });

    it('should have healthCheck method', async () => {
      expect(appController.healthCheck).toBeDefined();
      expect(typeof appController.healthCheck).toBe('function');
      const result = await appController.healthCheck();
      expect(result).toEqual({
        status: 'ok',
        db: 'ok',
      });
    });
  });
});
