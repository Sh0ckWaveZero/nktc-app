import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClassroomService } from './classroom.service';

@ApiTags('classrooms')
@Controller('classrooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) { }

  @Get()
  async findAll() {
    return await this.classroomService.findAll();
  }

  @Get('teacher/:id')
  @HttpCode(HttpStatus.OK)
  async findByTeacherId(@Param('id') id: string) {
    return await this.classroomService.findByTeacherId(id);
  }
}
