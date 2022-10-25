import {
  Controller,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Put,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('teachers')
@Controller('teachers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) { }

  @Get()
  async findAll(@Query() { q }) {
    return await this.teachersService.findAll(q);
  }

  @Put(':id/classrooms')
  async updateClassroom(@Param('id') id: string, @Body() updateTeacherDto: any) {
    try {
      const response = await this.teachersService.updateClassroom(id, updateTeacherDto)
      return response;
    } catch (error) {
      console.log('error', error)
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'Cannot update teacher',
      }, HttpStatus.FORBIDDEN);
    }
  }

  @Put(':id/profile')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateProfile(@Param('id') id: string, @Body() updateTeacherDto: any) {
    try {
      const response = await this.teachersService.updateProfile(id, updateTeacherDto)
      return response;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.NO_CONTENT,
        error: 'Cannot update teacher',
      }, HttpStatus.NO_CONTENT);
    }
  }

  @Get(':id/check-in')
  async getCheckIn(@Param('id') id: string) {
    return await this.teachersService.getCheckIn(id);
  }
}
