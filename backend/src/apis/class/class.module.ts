import { Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';

@Module({
  controllers: [ClassController],
  providers: [ClassService],
})
export class ClassModule {}
