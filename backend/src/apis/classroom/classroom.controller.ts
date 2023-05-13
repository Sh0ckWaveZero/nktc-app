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

  @Post('search')
  async search(@Body() body: any) {
    return await this.classroomService.search(body);
  }

  @Get('teacher/:id')
  @HttpCode(HttpStatus.OK)
  async findByTeacherId(@Param('id') id: string) {
    return await this.classroomService.findByTeacherId(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any) {
    return await this.classroomService.create(body);
  }

  // delete
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param('id') id: string) {
    return await this.classroomService.deleteById(id);
  }
}
