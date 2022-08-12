import { Module } from '@nestjs/common';
import { AppBarService } from './app-bar.service';
import { AppBarController } from './app-bar.controller';
import { PrismaService as PrismaMongoDbService } from './../prisma/prisma-mongodb.service';

@Module({
  controllers: [AppBarController],
  providers: [AppBarService, PrismaMongoDbService],
})
export class AppBarModule { }
