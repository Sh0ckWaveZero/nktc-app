import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Account, Role, Student, Teacher } from '@prisma/client';

export class LoginUserDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  account: Account

  @ApiProperty()
  student: Student

  @ApiProperty()
  teacher: Teacher

  @ApiProperty()
  @IsNotEmpty()
  role: Role
}

export class UpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  new_password: string;

  @ApiProperty()
  @IsNotEmpty()
  old_password: string;
}