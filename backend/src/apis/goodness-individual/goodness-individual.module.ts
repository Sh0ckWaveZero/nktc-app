import { Module } from '@nestjs/common';
import { GoodnessIndividualService } from './goodness-individual.service';
import { GoodnessIndividualController } from './goodness-individual.controller';
import { PrismaService } from '../../common/services/prisma.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [GoodnessIndividualController],
  providers: [GoodnessIndividualService, PrismaService],
})
export class GoodnessIndividualModule {}
