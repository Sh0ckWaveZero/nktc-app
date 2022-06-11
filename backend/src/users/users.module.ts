import { Module } from '@nestjs/common';


import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";


import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma.service";
import { AuthController } from '../auth/auth.conroller';
import { AuthService } from '../auth/auth.service';
import { JwtStrategy } from '../auth/jwt.strategy';



@Module({
  imports: [
    UsersModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: {
        expiresIn: process.env.EXPIRESIN,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtStrategy, PrismaService],
  exports: [
    PassportModule,
    JwtModule
  ],
})
export class UsersModule {
}