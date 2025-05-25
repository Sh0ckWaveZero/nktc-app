import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@apis/auth/jwt-auth.guard';
import { ClassroomService } from './classroom.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClassroomFileUploadDto } from './dto/file-upload.dto';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('classrooms')
@Controller('classrooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

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

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'ไฟล์ XLSX ที่มีข้อมูลห้องเรียน (คอลัมน์ที่จำเป็น: รหัส, ชื่อระดับชั้นเรียนสาขาวิชา, ระดับชั้น, แผนกวิชา)',
    type: ClassroomFileUploadDto,
  })
  @ApiOperation({ summary: 'นำเข้าข้อมูลห้องเรียนจากไฟล์ XLSX (เฉพาะผู้ดูแลระบบ)' })
  @HttpCode(HttpStatus.OK)
  async uploadXlsx(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return await this.classroomService.importFromXlsx(file, req.user);
  }
}
