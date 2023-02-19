import { Module } from '@nestjs/common';
import { GoodnessIndividualService } from './goodness-individual.service';
import { GoodnessIndividualController } from './goodness-individual.controller';
import { PrismaService } from '../../common/services/prisma.service';
import { MinioClientModule } from '../minio/minio-client.module';

@Module({
  imports: [MinioClientModule],
  controllers: [GoodnessIndividualController],
  providers: [GoodnessIndividualService, PrismaService]
})
export class GoodnessIndividualModule { }
