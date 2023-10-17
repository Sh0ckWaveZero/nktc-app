import { Module } from '@nestjs/common';
import { StaticsService } from './statics.service';
import { StaticsController } from './statics.controller';
import { MinioClientModule } from '../minio/minio-client.module';

@Module({
  imports: [MinioClientModule],
  controllers: [StaticsController],
  providers: [StaticsService],
})
export class StaticsModule {}
