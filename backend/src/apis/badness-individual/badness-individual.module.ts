import { Module } from '@nestjs/common';
import { BadnessIndividualService } from './badness-individual.service';
import { BadnessIndividualController } from './badness-individual.controller';
import { StorageModule } from '../storage/storage.module';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  imports: [StorageModule],
  controllers: [BadnessIndividualController],
  providers: [BadnessIndividualService, PrismaService],
})
export class BadnessIndividualModule {}
