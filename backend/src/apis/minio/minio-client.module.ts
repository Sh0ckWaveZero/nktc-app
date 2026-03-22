import { Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
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
        // useSSL: configService.get(CONFIG_KEYS.MINIO_USE_SSL) ? true : false,// If on localhost, keep it at false. If deployed on https, change to true
        useSSL: false, // If on localhost, keep it at false. If deployed on https, change to true
        accessKey: configService.get(CONFIG_KEYS.MINIO_ACCESS_KEY),
        secretKey: configService.get(CONFIG_KEYS.MINIO_SECRET_KEY),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
