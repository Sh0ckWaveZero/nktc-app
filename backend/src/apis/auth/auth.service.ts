import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/generated/prisma/client/client';
import { UsersService } from '../../apis/users/users.service';
import { JwtPayload } from './jwt.strategy';
import configuration from '@/config/configuration';

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
  ) {}

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

  async login(loginUserDto: any, _ipAddress: string): Promise<any> {
    // find user in db
    const loginResults = await this.usersService.login(loginUserDto);

    if (!loginResults) {
      return null;
    }

    // generate and sign token
    const token = this.createAccessToken(loginResults);

    return {
      success: true,
      message: 'login successfully',
      data: loginResults,
      ...token,
    };
  }

  async updatePassword(updatePasswordDto: any, id: string) {
    // update password
    const user = await this.usersService.updatePassword(updatePasswordDto, id);

    // remove password from user object
    const { password: _p, ...rest } = user;

    // generate and sign token
    const token = this.createAccessToken(rest);
    return {
      success: true,
      message: 'Password has been updated successfully',
      data: rest,
      ...token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findById(payload.sub);
    if (!user)
      throw new HttpException('INVALID_TOKEN', HttpStatus.UNAUTHORIZED);
    return user;
  }

  public async getMe(user: any) {
    return await this.usersService.findById(user.id);
  }

  private createAccessToken(data: any): any {
    const payload = { username: data.username, sub: data.id, roles: data.role };
    const user: JwtPayload = payload;

    const token = this.jwtService.sign(user);
    return {
      expiresIn: configuration().jwtExpiresIn,
      token,
    };
  }
}