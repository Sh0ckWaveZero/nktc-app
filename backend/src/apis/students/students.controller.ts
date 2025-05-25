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
  Request,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentFileUploadDto } from './dto';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('students')
@Controller('students')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('download')
  @HttpCode(200)
  async findBucket() {
    return this.studentsService.findBucket();
  }

  @Get('download-template')
  @ApiOperation({ summary: 'ดาวน์โหลดไฟล์ Excel แม่แบบสำหรับการอัพโหลดข้อมูลนักเรียน' })
  @HttpCode(200)
  async downloadTemplate(@Response() res) {
    return this.studentsService.downloadTemplate(res);
  }

  @Get('search')
  async search(@Query() query: any) {
    try {
      return await this.studentsService.search(query);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: error?.message || 'Cannot search student',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Get('list')
  async list(@Query() query: any) {
    try {
      return await this.studentsService.list(query);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: error?.message || 'Cannot search student',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Post('search-with-params')
  async findWithParams(@Body() body: any) {
    return await this.studentsService.findWithParams(body);
  }

  @Post('profile/:id')
  @HttpCode(HttpStatus.CREATED)
  async createProfile(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.studentsService.createProfile(id, body);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: error?.message || 'Cannot create student',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Put('profile/:id')
  @HttpCode(HttpStatus.CREATED)
  async updateProfile(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.studentsService.updateProfile(id, body);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Cannot update student',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Delete('profile/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStudent(@Param('id') id: string) {
    try {
      return await this.studentsService.deleteStudent(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Cannot delete student',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('trophy-overview/:id')
  async getTrophyOverview(@Param('id') id: string) {
    try {
      return await this.studentsService.getTrophyOverview(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Cannot get trophy overview',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'ไฟล์ XLSX ที่มีข้อมูลนักเรียน (คอลัมน์ที่จำเป็น: เลขประจำตัวประชาชน, รหัสประจำตัว, กลุ่มเรียน, คำนำหน้าชื่อ, ชื่อ (ไทย), นามสกุล (ไทย), สาขาวิชา, แผนก, ประเภทนักเรียน)',
    type: StudentFileUploadDto,
  })
  @ApiOperation({ summary: 'นำเข้าข้อมูลนักเรียนจากไฟล์ XLSX (เฉพาะผู้ดูแลระบบ)' })
  @HttpCode(HttpStatus.OK)
  async uploadXlsx(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return await this.studentsService.importFromXlsx(file, req.user);
  }

  @Get('classroom/:id/teacher')
  async getTeacherClassroom(@Param('id') id: string) {
    try {
      return await this.studentsService.getTeacherClassroom(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Cannot get teacher classroom',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
