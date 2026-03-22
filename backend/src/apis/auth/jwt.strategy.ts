import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { CONFIG_KEYS } from '../../config/config.constants';
import type { AuthUser, JwtPayload } from './interfaces';

// Re-export for backward compatibility
export type { JwtPayload } from './interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(CONFIG_KEYS.JWT_SECRET),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    return await this.authService.validateUser(payload);
  }
}
