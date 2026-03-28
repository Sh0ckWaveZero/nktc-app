import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { PrismaService } from '../../common/services/prisma.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [TeachersController],
  providers: [TeachersService, PrismaService],
})
export class TeachersModule {}
