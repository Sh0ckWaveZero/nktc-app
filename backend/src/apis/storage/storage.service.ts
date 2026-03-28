import * as crypto from 'crypto';

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import configuration from '../../config/configuration';
import { MinioService } from '../../lib';

@Injectable()
export class StorageService {
  private readonly logger: Logger;
  constructor(private readonly minio: MinioService) {
    this.logger = new Logger('StorageService');

    // Bucket policy: allow public read-only for serving files
    // Write/delete operations are restricted to the IAM user (nktc-app-s3) via minio-init.sh policy
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: ['*'],
          },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${configuration().minioBucket}/*`],
        },
      ],
    };
    this.client
      .setBucketPolicy(configuration().minioBucket, JSON.stringify(policy))
      .then(() => {
        this.logger.log('Bucket policy set');
      })
      .catch((err) => {
        throw err;
      });
  }

  private readonly bucketName = configuration().minioBucket;

  public get client() {
    return this.minio.client;
  }

  public async upload(file: any, bucketName: string = this.bucketName) {
    try {
      const buffer = Buffer.from(
        file?.data.replace(/^data:image\/\w+;base64,/, ''),
        'base64',
      );
      const timestamp = Date.now().toString();
      const hashedFileName = crypto
        .createHash('md5')
        .update(timestamp)
        .digest('hex');
      const extension = '.webp';
      const metaData: any = {
        'Content-Type': 'image/webp',
      };
      const fileName = `${file.path}${hashedFileName}${extension}`;

      await this.client.putObject(bucketName, fileName, buffer, undefined, metaData);

      return {
        url: `${configuration().hostUrl}/statics/${fileName}`,
      };
    } catch (err) {
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }
  }

  async delete(objetName: string, bucketName: string = this.bucketName) {
    try {
      await this.client.removeObject(bucketName, objetName);
      this.logger.log('File deleted successfully');
    } catch (error) {
      throw new HttpException(
        'An error occured when deleting!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
