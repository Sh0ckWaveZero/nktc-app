import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../common/services/prisma.service';
import { AuthController } from './auth.conroller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';
import { CONFIG_KEYS } from '../../config/config.constants';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(CONFIG_KEYS.JWT_SECRET),
        signOptions: {
          expiresIn: configService.get<string>(CONFIG_KEYS.JWT_EXPIRES_IN) ?? '1d',
        },
      }),
    } as Parameters<typeof JwtModule.registerAsync>[0]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    LocalStrategy,
  ],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
