import { Module } from '@nestjs/common';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [LevelController],
  providers: [LevelService, PrismaService]
})
export class LevelModule { }
