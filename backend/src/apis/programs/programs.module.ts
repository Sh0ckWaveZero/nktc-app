import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';
import { PrismaService } from '../../common/services/prisma.service';

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
  controllers: [ProgramsController],
  providers: [ProgramsService, PrismaService],
})
export class ProgramsModule {}
