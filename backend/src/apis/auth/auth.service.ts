import { HttpException, HttpStatus, Injectable, Query } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UsersService } from '../../apis/users/users.service';
import configuration from '../../config/configuration';
import { JwtPayload } from './jwt.strategy';
import { Tokens } from './types/tokens.type';
import { PrismaService } from '../../common/services/prisma.service';

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
    private readonly prisma: PrismaService,
  ) { }

  async register(userDto: any): Promise<RegistrationStatus> {
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

  async login(loginUserDto: any, ipAddress: string): Promise<any> {
    // find user in db
    const info = await this.usersService.login(loginUserDto);

    if (!info) {
      return null;
    }

    // generate and sign token
    const tokens = await this.getTokens(info);
    await this.updateRefreshToken(info?.id as any, tokens.refresh_token);


    return {
      success: true,
      message: 'login successfully',
      data: info,
      ...tokens,
    };
  }

  async updatePassword(updatePasswordDto: any, id: string) {
    // update password
    const user = await this.usersService.updatePassword(updatePasswordDto, id);

    // remove password from user object
    const { password: p, ...rest } = user;

    // generate and sign token
    const tokens = await this.getTokens(rest);
    await this.updateRefreshToken(rest?.id as any, tokens.refresh_token);

    return {
      success: true,
      message: 'Password has been updated successfully',
      data: rest,
      ...tokens,
    };
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findByPayload(payload);
    if (!user)
      throw new HttpException('INVALID_TOKEN', HttpStatus.UNAUTHORIZED);
    return user;
  }

  public async getMe(user: any) {
    return await this.usersService.finedById(user.id);
  }

  async updateRefreshToken(userId: number, rt: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId as any,
      },
      data: {
        refreshToken: rt,
      },
    });
  }

  async getTokens(data: any): Promise<Tokens> {
    const payload = { username: data?.username, sub: data?.id, roles: data?.role };

    const user: JwtPayload = payload;

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(user, {
        secret: configuration().jwtSecret,
        expiresIn: configuration().jwtExpiresIn,
      }),
      this.jwtService.signAsync(user, {
        secret: configuration().rtSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
