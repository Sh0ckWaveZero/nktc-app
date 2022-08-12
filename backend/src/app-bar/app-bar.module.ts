import { Module } from '@nestjs/common';
import { AppBarService } from './app-bar.service';
import { AppBarController } from './app-bar.controller';

@Module({
  controllers: [AppBarController],
  providers: [AppBarService]
})
export class AppBarModule {}
