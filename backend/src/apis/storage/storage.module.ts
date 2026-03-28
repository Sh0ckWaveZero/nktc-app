import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioModule } from '../../lib';
import { CONFIG_KEYS } from '../../config/config.constants';

@Module({
  imports: [
    MinioModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        endPoint: configService.get(CONFIG_KEYS.MINIO_ENDPOINT),
        port: parseInt(configService.get(CONFIG_KEYS.MINIO_PORT)),
        useSSL: configService.get<boolean>(CONFIG_KEYS.MINIO_USE_SSL),
        accessKey: configService.get(CONFIG_KEYS.MINIO_ACCESS_KEY),
        secretKey: configService.get(CONFIG_KEYS.MINIO_SECRET_KEY),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
