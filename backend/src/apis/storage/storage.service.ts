import * as Minio from 'minio';
import * as crypto from 'crypto';

import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import configuration from '../../config/configuration';
import { ConfigService } from '@nestjs/config';
import { CONFIG_KEYS } from '../../config/config.constants';
import { UploadFileDto, FileResponseDto } from './dtos';

@Injectable()
export class StorageService {
  private readonly logger = new Logger('StorageService');
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>(
      CONFIG_KEYS.MINIO_BUCKET_NAME,
    )!;
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>(CONFIG_KEYS.MINIO_ENDPOINT)!,
      port: this.configService.get<number>(CONFIG_KEYS.MINIO_PORT) || 9000,
      useSSL: false,
      accessKey: this.configService.get<string>(CONFIG_KEYS.MINIO_ACCESS_KEY)!,
      secretKey: this.configService.get<string>(CONFIG_KEYS.MINIO_SECRET_KEY)!,
    });

    // Bucket policy: allow public read-only for serving files
    // Write/delete operations are restricted to the IAM user (nktc-app-s3) via minio-init.sh policy
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        },
      ],
    };

    this.minioClient
      .setBucketPolicy(this.bucketName, JSON.stringify(policy))
      .then(() => this.logger.log('Bucket policy set'))
      .catch((err) => this.logger.error('Failed to set bucket policy', err));
  }

  public get client(): Minio.Client {
    return this.minioClient;
  }

  public async upload(
    file: UploadFileDto,
    bucketName: string = this.bucketName,
  ): Promise<FileResponseDto> {
    try {
      const buffer = Buffer.from(
        file.data.replace(/^data:image\/\w+;base64,/, ''),
        'base64',
      );
      const timestamp = Date.now().toString();
      const hashedFileName = crypto
        .createHash('md5')
        .update(timestamp)
        .digest('hex');
      const extension = '.webp';
      const metaData: Minio.ItemBucketMetadata = {
        'Content-Type': 'image/webp',
      };
      const pathPrefix = file.path || '';
      const fileName = `${pathPrefix}${hashedFileName}${extension}`;

      await this.minioClient.putObject(
        bucketName,
        fileName,
        buffer,
        undefined,
        metaData,
      );

      return new FileResponseDto({
        id: hashedFileName,
        name: fileName,
        encoding: 'base64',
        mimetype: 'image/webp' as any,
        size: buffer.length,
        url: `${configuration().hostUrl}/statics/${fileName}`,
      });
    } catch (err) {
      this.logger.error('Error uploading file', err);
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }
  }

  async delete(objectName: string, bucketName: string = this.bucketName): Promise<void> {
    try {
      await this.minioClient.removeObject(bucketName, objectName);
      this.logger.log('File deleted successfully');
    } catch (error) {
      this.logger.error('Error deleting file', error);
      throw new HttpException(
        'An error occured when deleting!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
