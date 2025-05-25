import {
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@apis/auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/guards/roles.decorator';
import { ProgramsService } from './programs.service';
import { ProgramFileUploadDto } from './dto/file-upload.dto';

@Controller('programs')
@ApiTags('programs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  async findAll() {
    try {
      const response = await this.programsService.findAll();
      return response;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Cannot get programs',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'ไฟล์ XLSX ที่มีข้อมูลโปรแกรม (คอลัมน์ที่จำเป็น: รหัส, ชื่อ, รายละเอียด)',
    type: ProgramFileUploadDto,
  })
  @ApiOperation({ summary: 'นำเข้าข้อมูลโปรแกรมจากไฟล์ XLSX (เฉพาะผู้ดูแลระบบ)' })
  @HttpCode(HttpStatus.OK)
  async uploadXlsx(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return await this.programsService.importFromXlsx(file, req.user);
  }
}
