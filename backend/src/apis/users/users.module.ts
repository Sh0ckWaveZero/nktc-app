import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/services/prisma.service';
import { AuthController } from '../auth/auth.conroller';
import { AuthService } from '../auth/auth.service';
import configuration from '../../config/configuration';
import { UsersController } from './users.controller';
import { JwtStrategy } from '../auth/strategies';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: configuration().jwtSecret,
      signOptions: {
        expiresIn: configuration().jwtExpiresIn,
      },
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService, JwtStrategy, PrismaService],
  exports: [PassportModule, JwtModule],
})
export class UsersModule { }
