import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { PrismaService } from '../../common/services/prisma.service';
import { MinioClientModule } from '../minio/minio-client.module';

@Module({
  imports: [MinioClientModule],
  controllers: [TeachersController],
  providers: [TeachersService, PrismaService],
})
export class TeachersModule {}
