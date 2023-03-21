import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@ApiSecurity('access-key')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  public async me(@Request() req: any) {
    return this.usersService.findByPayload(req);
  }

  @Get(':id')
  public async findById(
    @Param('id') id: string
  ) {
    try {
      return await this.usersService.findById(id);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: 'Cannot get user',
      }, HttpStatus.FORBIDDEN);
    }
  }

  @Put('update/password')
  public async updatePassword(
    @Request() req: any,
    @Body() updatePasswordDto: any,
  ) {
    await this.usersService.updatePassword(updatePasswordDto, req.user.id);
    return { message: 'password_update_success' };
  }

  // change password for admin
  @Put('update/password/:id')
  public async updatePasswordForAdmin(
    @Param('id') id: string,
    @Body() updatePasswordDto: any,
  ) {
    await this.usersService.updatePasswordForAdmin(updatePasswordDto, id);
    return { message: 'password_update_success' };
  }
}
