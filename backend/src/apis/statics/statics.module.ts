import { Module } from '@nestjs/common';
import { StaticsService } from './statics.service';
import { StaticsController } from './statics.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [StaticsController],
  providers: [StaticsService],
})
export class StaticsModule {}
