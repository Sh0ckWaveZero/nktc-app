import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
} from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Get('get-visit/all')
  async getVisits(
    @Query('classroomId') classroomId: string,
    @Query('academicYear') academicYear: string,
    @Query('visitNo') visitNo: string,
  ) {
    return await this.visitsService.getVisits(
      classroomId,
      academicYear,
      visitNo,
    );
  }
}
