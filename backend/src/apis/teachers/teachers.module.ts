import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService, PrismaService],
})
export class TeachersModule {}
