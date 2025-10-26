import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username for login',
    example: 'nk200',
  })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiProperty({
    description: 'User role',
    example: 'USER',
    enum: ['USER', 'ADMIN', 'TEACHER'],
  })
  @IsString({ message: 'Role must be a string' })
  @IsNotEmpty({ message: 'Role is required' })
  role?: string;
}

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'oldpassword123',
  })
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'newpassword123',
    minLength: 6,
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'newpassword123',
  })
  @IsString({ message: 'Password confirmation must be a string' })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  confirmPassword: string;
}
