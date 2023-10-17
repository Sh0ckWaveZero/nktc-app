import { HttpException, HttpStatus, Injectable, Query } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UsersService } from '../../apis/users/users.service';
import configuration from '../../config/configuration';
import { JwtPayload } from './jwt.strategy';

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

  async login(loginUserDto: any, ipAddress: string): Promise<any> {
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
    const { password: p, ...rest } = user;

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
    const user = await this.usersService.findByPayload(payload);
    if (!user)
      throw new HttpException('INVALID_TOKEN', HttpStatus.UNAUTHORIZED);
    return user;
  }

  public async getMe(user: any) {
    return await this.usersService.finedById(user.id);
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
