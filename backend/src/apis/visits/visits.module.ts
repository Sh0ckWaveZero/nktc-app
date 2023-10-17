import { Module } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [VisitsController],
  providers: [VisitsService, PrismaService],
})
export class VisitsModule {}
