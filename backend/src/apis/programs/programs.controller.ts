import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
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
import { UpdateProgramDto } from './dto/update-program.dto';

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
          error: 'ไม่สามารถดึงข้อมูลสาขาวิชาได้',
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
    description: 'ไฟล์ XLSX ที่มีข้อมูลสาขาวิชา (คอลัมน์ที่จำเป็น: รหัส, ชื่อ, รายละเอียด)',
    type: ProgramFileUploadDto,
  })
  @ApiOperation({ summary: 'นำเข้าข้อมูลสาขาวิชาจากไฟล์ XLSX (เฉพาะผู้ดูแลระบบ)' })
  @HttpCode(HttpStatus.OK)
  async uploadXlsx(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return await this.programsService.importFromXlsx(file, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'ลบสาขาวิชา/หลักสูตร (เฉพาะผู้ดูแลระบบ)' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    try {
      const response = await this.programsService.remove(id);
      return {
        status: HttpStatus.OK,
        message: 'ลบสาขาวิชาสำเร็จ',
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message || 'ไม่สามารถลบข้อมูลสาขาวิชาได้',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'อัพเดทข้อมูลสาขาวิชา/หลักสูตร (เฉพาะผู้ดูแลระบบ)' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string, 
    @Body() updateProgramDto: UpdateProgramDto,
    @Request() req,
  ) {
    try {
      const response = await this.programsService.update(id, updateProgramDto, req.user.username);
      return {
        status: HttpStatus.OK,
        message: 'อัพเดทสาขาวิชาสำเร็จ',
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message || 'ไม่สามารถอัพเดทข้อมูลสาขาวิชาได้',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดึงข้อมูลสาขาวิชา/หลักสูตรตาม ID' })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    try {
      const response = await this.programsService.findOne(id);
      return {
        status: HttpStatus.OK,
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: error.message || 'ไม่พบข้อมูลสาขาวิชา',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
