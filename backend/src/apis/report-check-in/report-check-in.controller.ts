import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ReportCheckInService } from './report-check-in.service';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/common/guards';

@UseGuards(JwtAuthGuard)
@ApiTags('reportCheckIn')
@Controller('reportCheckIn')
export class ReportCheckInController {
  constructor(private readonly reportCheckInService: ReportCheckInService) {}

  @Post()
  async create(
    @Body() createReportCheckInDto: Prisma.ReportCheckInCreateManyInput,
  ) {
    try {
      return await this.reportCheckInService.create(createReportCheckInDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  @Get('teacher/:teacherId/classroom/:classroomId')
  async findOneByTeacherId(
    @Param('teacherId') teacherId: string,
    @Param('classroomId') classroomId: string,
  ) {
    try {
      return await this.reportCheckInService.findOne(teacherId, classroomId);
    } catch (error) {
      if (error.message === 'No ReportCheckIn found') {
        return {};
      }
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  @Get(
    'teacher/:teacherId/classroom/:classroomId/start-date/:date/daily-report',
  )
  async findDailyReport(
    @Param('teacherId') teacherId: string,
    @Param('classroomId') classroomId: string,
    @Param('date') date: string,
  ) {
    try {
      return await this.reportCheckInService.findDailyReport(
        teacherId,
        classroomId,
        date,
      );
    } catch (error) {
      if (error.message === 'No ReportCheckIn found') {
        return {};
      }
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  @Get('/start-date/:startDate/end-date/:endDate/admin-daily-report')
  async findDailyReportByAdmin(
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string,
  ) {
    try {
      return await this.reportCheckInService.findDailyReportByAdmin(
        startDate,
        endDate,
      );
    } catch (error) {
      if (error.message === 'No ReportCheckIn found') {
        return {};
      }
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  @Get('teacher/:teacherId/classroom/:classroomId/summary-report')
  async findSummaryReport(
    @Param('teacherId') teacherId: string,
    @Param('classroomId') classroomId: string,
  ) {
    try {
      return await this.reportCheckInService.findSummaryReport(
        teacherId,
        classroomId,
      );
    } catch (error) {
      if (error.message === 'No ReportCheckIn found') {
        return {};
      }
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  @Patch(':id/daily-report')
  async updateDailyReport(
    @Param('id') id: string,
    @Body() updateDailyReportDto: any,
  ) {
    try {
      return await this.reportCheckInService.updateDailyReport(
        id,
        updateDailyReportDto,
      );
    } catch (error) {
      if (error.message === 'No ReportCheckIn found') {
        return {};
      }
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.reportCheckInService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  @Get(
    'student/:studentId/classroom/:classroomId/start-date/:start/end-date/:end/weekly-report',
  )
  async findWeeklyReport(
    @Param('studentId') studentId: string,
    @Param('classroomId') classroomId: string,
    @Param('start') start: string,
    @Param('end') end: string,
  ) {
    try {
      return await this.reportCheckInService.findStudentDailyReport(
        studentId,
        classroomId,
        start,
        end,
      );
    } catch (error) {
      if (error.message === 'No ReportCheckIn found') {
        return {};
      }
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }
}
