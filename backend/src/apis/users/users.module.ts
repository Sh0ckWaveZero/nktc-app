import { Module } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UsersService } from './users.service';
import { PrismaService } from '../../common/services/prisma.service';
import { AuthController } from '../auth/auth.conroller';
import { AuthService } from '../auth/auth.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import configuration from 'src/config/configuration';

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
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtStrategy, PrismaService],
  exports: [PassportModule, JwtModule],
})
export class UsersModule {}
