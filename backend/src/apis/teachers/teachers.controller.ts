import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('teachers')
@Controller('teachers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) { }

  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  async findAll(@Query() { role, status, q, currentPlan }) {
    return await this.teachersService.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(+id);
  }

  @Put('classroom/:id')
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachersService.remove(+id);
  }
}
