import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { ReportCheckInService } from './report-check-in.service';
import { UpdateReportCheckInDto } from './dto/update-report-check-in.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from "@prisma/client";

@UseGuards(JwtAuthGuard)
@ApiTags('reportCheckIn')
@Controller('reportCheckIn')
export class ReportCheckInController {
  constructor(private readonly reportCheckInService: ReportCheckInService) { }

  @Post()
  async create(@Body() createReportCheckInDto: Prisma.ReportCheckInCreateManyInput) {
    try {
      return await this.reportCheckInService.create(createReportCheckInDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  @Get()
  findAll() {
    return this.reportCheckInService.findAll();
  }

  @Get('teacher/:teacherId/classroom/:classroomId')
  async findOneByTeacherId(@Param('teacherId') teacherId: string, @Param('classroomId') classroomId: string) {
    try {
      return await this.reportCheckInService.findOne(teacherId, classroomId);
    } catch (error) {
      if (error.message === 'No ReportCheckIn found') {
        return {}
      }
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportCheckInDto: UpdateReportCheckInDto) {
    return this.reportCheckInService.update(+id, updateReportCheckInDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportCheckInService.remove(+id);
  }
}
