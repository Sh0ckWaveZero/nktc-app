import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';
import { User } from '../../database/generated/prisma/client/client';
import { UsersService } from '../../apis/users/users.service';
import { RegisterDto, UpdatePasswordDto } from './dto';
import { CONFIG_KEYS } from '../../config/config.constants';
import type {
  AuthUser,
  JwtPayload,
  LoginResponse,
  RefreshTokenPayload,
} from './interfaces';

export interface RegistrationStatus {
  success: boolean;
  message: string;
  data?: User;
}

export interface RegistrationSeederStatus {
  success: boolean;
  message: string;
  data?: User[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(userDto: RegisterDto): Promise<RegistrationStatus> {
    try {
      const data = await this.usersService.create(userDto);
      return {
        success: true,
        message: 'ACCOUNT_CREATE_SUCCESS',
        data,
      };
    } catch (err) {
      return {
        success: false,
        message: err,
      };
    }
  }

  async updatePassword(
    updatePasswordDto: UpdatePasswordDto,
    id: string,
  ): Promise<any> {
    const user = await this.usersService.updatePassword(updatePasswordDto, id);
    const { password: _p, ...rest } = user;
    const { token } = this.createAccessToken(rest as AuthUser);
    return {
      success: true,
      message: 'Password has been updated successfully',
      data: rest,
      token,
    };
  }

  async validateCredentials(
    username: string,
    password: string,
  ): Promise<AuthUser> {
    return await this.usersService.login({ username, password });
  }

  async loginUser(user: AuthUser): Promise<LoginResponse> {
    const { token } = this.createAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return {
      success: true,
      message: 'login successfully',
      data: user,
      token,
      refreshToken,
    };
  }

  async validateUser(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user)
      throw new HttpException('INVALID_TOKEN', HttpStatus.UNAUTHORIZED);
    return user as AuthUser;
  }

  async refreshAccessToken(refreshToken: string): Promise<{ token: string }> {
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.get<string>(CONFIG_KEYS.JWT_REFRESH_SECRET),
      });
    } catch {
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('INVALID_REFRESH_TOKEN');

    const isValid = await this.usersService.verifyRefreshToken(
      payload.sub,
      refreshToken,
    );
    if (!isValid) throw new UnauthorizedException('INVALID_REFRESH_TOKEN');

    return this.createAccessToken(user as AuthUser);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.clearRefreshToken(userId);
  }

  async getMe(user: Pick<AuthUser, 'id'>): Promise<any> {
    return await this.usersService.findById(user.id);
  }

  private createAccessToken(data: AuthUser): { token: string } {
    const payload: JwtPayload = {
      username: data.username,
      sub: data.id,
      roles: data.role,
    };
    return { token: this.jwtService.sign(payload) };
  }

  private async generateRefreshToken(user: AuthUser): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      username: user.username,
    };
    const rawToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>(CONFIG_KEYS.JWT_REFRESH_SECRET),
      expiresIn:
        this.configService.get<string>(CONFIG_KEYS.JWT_REFRESH_EXPIRES_IN) ??
        '7d',
    } as Parameters<typeof this.jwtService.sign>[1]);
    const hashed = await hash(rawToken, 10);
    await this.usersService.storeRefreshToken(user.id, hashed);
    return rawToken;
  }
}
