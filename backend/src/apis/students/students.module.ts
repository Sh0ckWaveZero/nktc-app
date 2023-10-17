import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaService } from '../../common/services/prisma.service';
import { MinioClientModule } from '../minio/minio-client.module';

@Module({
  imports: [MinioClientModule],
  controllers: [StudentsController],
  providers: [StudentsService, PrismaService],
})
export class StudentsModule {}
