import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto, UpdatePasswordDto, LoginUserDto } from './dto/users.dto';
import { compare, hash } from 'bcrypt'

interface FormatLogin extends Partial<User> {
  username: string
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService
  ) { }

  async updatePassword(payload: UpdatePasswordDto, id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      }
    });

    if (!user) {
      throw new HttpException("invalid_credentials", HttpStatus.UNAUTHORIZED);
    }

    // compare password
    const isValid = await compare(payload.old_password, user.password);
    if (!isValid) {
      throw new HttpException("invalid_credentials", HttpStatus.UNAUTHORIZED);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        password: await hash(payload.new_password, 12)
      }
    });
  }

  async create(userDto: CreateUserDto): Promise<any> {
    // check if user already exists in database
    const user = await this.prisma.user.findFirst({
      where: { username: userDto.username }
    });

    if (user) {
      throw new HttpException("user_already_exists", HttpStatus.CONFLICT);
    }
    console.log(userDto.account);

    let newUser: {}
    try {
      newUser = await this.prisma.user.create({
        data: {
          ...(userDto),
          password: await hash(userDto.password, 12),
        }
      });
    } catch (error) {
      console.log(error);
      throw new HttpException("Can't create user", HttpStatus.INTERNAL_SERVER_ERROR);
    }
    console.log('newUser', newUser);

    return newUser;
  }
  //use by auth module to login user
  async findByLogin({ username, password }: LoginUserDto): Promise<FormatLogin> {
    const user = await this.prisma.user.findFirst({
      where: { username }
    });

    if (!user) {
      throw new HttpException("invalid_credentials", HttpStatus.UNAUTHORIZED);
    }

    // compare passwords
    const isValid = await compare(password, user.password);

    if (!isValid) {
      throw new HttpException("invalid_credentials", HttpStatus.UNAUTHORIZED);
    }

    const { password: p, ...rest } = user;
    return rest;
  }

  //use by auth module to get user in database
  async findByPayload({ username }: any): Promise<any> {
    return await this.prisma.user.findFirst({
      where: { username }
    });
  }
}