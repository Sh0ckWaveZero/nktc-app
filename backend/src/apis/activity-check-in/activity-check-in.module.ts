import { Module } from '@nestjs/common';
import { ActivityCheckInService } from './activity-check-in.service';
import { ActivityCheckInController } from './activity-check-in.controller';
import { PrismaService } from 'src/common/services/prisma.service';

@Module({
  controllers: [ActivityCheckInController],
  providers: [ActivityCheckInService, PrismaService]
})
export class ActivityCheckInModule { }
