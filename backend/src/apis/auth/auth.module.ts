import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthController } from './auth.conroller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';
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
  providers: [AuthService, UsersService, JwtStrategy, PrismaService, LocalStrategy],
  exports: [
    PassportModule,
    JwtModule
  ],
})
export class AuthModule {
}