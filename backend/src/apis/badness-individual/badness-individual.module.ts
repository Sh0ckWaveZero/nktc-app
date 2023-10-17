import { Module } from '@nestjs/common';
import { BadnessIndividualService } from './badness-individual.service';
import { BadnessIndividualController } from './badness-individual.controller';
import { MinioClientModule } from '../minio/minio-client.module';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  imports: [MinioClientModule],
  controllers: [BadnessIndividualController],
  providers: [BadnessIndividualService, PrismaService],
})
export class BadnessIndividualModule {}
