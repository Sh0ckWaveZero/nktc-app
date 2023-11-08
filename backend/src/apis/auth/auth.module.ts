import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../common/services/prisma.service';
import { AuthController } from './auth.conroller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';
import configuration from '../../config/configuration';
import { JwtStrategy, RtStrategy } from './strategies';

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
  providers: [
    AuthService,
    UsersService,
    JwtStrategy,
    RtStrategy,
    PrismaService,
    LocalStrategy,
  ],
  exports: [PassportModule, JwtModule],
})
export class AuthModule { }
