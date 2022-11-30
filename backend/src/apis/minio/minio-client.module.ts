import { Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { MinioModule } from 'nestjs-minio-client';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MinioModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        endPoint: configService.get('MINIO_ENDPOINT'),
        port: parseInt(configService.get('MINIO_PORT')),
        // useSSL: configService.get('MINIO_USE_SSL') ? true : false,// If on localhost, keep it at false. If deployed on https, change to true
        useSSL: true,// If on localhost, keep it at false. If deployed on https, change to true
        accessKey: configService.get('MINIO_ACCESS_KEY'),
        secretKey: configService.get('MINIO_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule { }

// MinioModule.register({
//   endPoint: configuration().minioEndpoint,
//   port: configuration().minioPort,
//   useSSL: configuration().minioUseSSL,
//   accessKey: configuration().minioAccessKey,
//   secretKey: configuration().minioSecretKey,
// }),