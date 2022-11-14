import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('students')
@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  @Get('classroom/:id')
  async findByClassroomId(@Param('id') id: string) {
    return await this.studentsService.findByClassroomId(id);
  }

  @Post('profile/:id')
  @HttpCode(HttpStatus.CREATED)
  async createProfile(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.studentsService.createProfile(id, body);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: error?.message || 'Cannot create student',
      }, HttpStatus.FORBIDDEN);
    }
  }


  @Put('profile/:id')
  @HttpCode(HttpStatus.CREATED)
  async updateProfile(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.studentsService.updateProfile(id, body);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'Cannot update student',
      }, HttpStatus.FORBIDDEN);
    }
  }

  @Delete('profile/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStudent(@Param('id') id: string) {
    try {
      return await this.studentsService.deleteStudent(id);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Cannot delete student',
      }, HttpStatus.BAD_REQUEST);
    }
  }
}
