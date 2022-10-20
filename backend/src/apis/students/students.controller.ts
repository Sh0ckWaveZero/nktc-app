import {
  Controller,
  Get,
  Param,
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
}
