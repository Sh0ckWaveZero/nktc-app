import { Module } from '@nestjs/common';
import { ReportCheckInService } from './report-check-in.service';
import { ReportCheckInController } from './report-check-in.controller';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [ReportCheckInController],
  providers: [ReportCheckInService, PrismaService]
})
export class ReportCheckInModule { }
