import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Query,
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
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  public async me(@Request() req: any) {
    return this.usersService.findByPayload(req);
  }

  @Get(':id')
  public async findById(@Param('id') id: string) {
    try {
      // Try to find by ID first, if not found, try by username
      const user = await this.usersService.findById(id);
      return user;
    } catch (error) {
      try {
        // If not found by ID, try to find by username
        return await this.usersService.findByUsername(id);
      } catch (usernameError) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Cannot get user by ID or username',
          },
          HttpStatus.FORBIDDEN,
        );
      }
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

  @Get('audit-logs/:username')
  @HttpCode(HttpStatus.OK)
  public async getAuditLogs(
    @Param('username') username: string,
    @Query('skip') skip: number,
    @Query('take') take: number,
  ) {
    try {
      return await this.usersService.getAuditLogs(username, skip, take);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Cannot get audit logs',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
