import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { CreateUserDto, LoginUserDto } from 'src/apis/users/dto/users.dto';
import { UsersService } from 'src/apis/users/users.service';
import configuration from 'src/config/configuration';
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
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  async register(userDto: CreateUserDto): Promise<RegistrationStatus> {
    let status: RegistrationStatus = {
      success: true,
      message: "ACCOUNT_CREATE_SUCCESS",
    };

    try {
      status.data = await this.usersService.create(userDto);
    } catch (err) {
      status.success = false;
      status.message = err;
    }
    return status;
  }


  async login(loginUserDto: LoginUserDto): Promise<any> {
    // find user in db
    const user = await this.usersService.findByLogin(loginUserDto);

    // generate and sign token
    const token = this._createToken(user);
    return {
      success: true,
      message: 'login successfully',
      data: user,
      ...token,
    }
  }

  private _createToken({ username }): any {
    const user: JwtPayload = { username };
    const token = this.jwtService.sign(user);
    return {
      expiresIn: configuration().jwtExpiresIn,
      token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findByPayload(payload);
    if (!user) {
      throw new HttpException("INVALID_TOKEN", HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  private async getMe() {
    const user = await this.usersService.findByPayload({ username: 'admin' });
    return user;
  }
}
