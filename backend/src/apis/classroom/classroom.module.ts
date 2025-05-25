import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { ClassroomController } from './classroom.controller';
import { PrismaService } from '../../common/services/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { LoggerMiddleware } from './logger.middleware';
import { memoryStorage } from 'multer';


@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(xlsx)$/)) {
          return callback(new Error('Only XLSX files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  ],
  controllers: [ClassroomController],
  providers: [ClassroomService, PrismaService],
})
export class ClassroomModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(
        { path: 'classrooms/upload', method: RequestMethod.POST },
      );
  }
}
