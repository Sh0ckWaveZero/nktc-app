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
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';


@ApiTags('students')
@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  @Get('download')
  @HttpCode(200)
  async findBucket() {
    return this.studentsService.findBucket();
  }

  @Get('search')
  async search(@Query() query: any) {
    try {
      return await this.studentsService.search(query);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: error?.message || 'Cannot search student',
      }, HttpStatus.FORBIDDEN);
    }
  }

  @Get('list')
  async list(@Query() query: any) {
    try {
      return await this.studentsService.list(query);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: error?.message || 'Cannot search student',
      }, HttpStatus.FORBIDDEN);
    }
  }

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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }


  @Get('trophy-overview/:id')
  async getTrophyOverview(@Param('id') id: string) {
    try {
      return await this.studentsService.getTrophyOverview(id);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Cannot get trophy overview',
      }, HttpStatus.BAD_REQUEST);
    }
  }
}
