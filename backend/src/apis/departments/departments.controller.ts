import {
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { DepartmentsService } from './departments.service';
import { FileUploadDto } from './dto/file-upload.dto';

@Controller('departments')
@ApiTags('departments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async findAll() {
    return await this.departmentsService.findAll();
  }

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'ไฟล์ XLSX ที่มีข้อมูลแผนกวิชา (คอลัมน์ที่จำเป็น: รหัสแผนกวิชา, ชื่อแผนกวิชา)',
    type: FileUploadDto,
  })
  @ApiOperation({ summary: 'นำเข้าข้อมูลแผนกวิชาจากไฟล์ XLSX (เฉพาะผู้ดูแลระบบ)' })
  @HttpCode(HttpStatus.OK)
  async uploadXlsx(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return await this.departmentsService.importFromXlsx(file, req.user);
  }
}
