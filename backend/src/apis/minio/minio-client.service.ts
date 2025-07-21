import * as crypto from 'crypto';

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import configuration from '../../config/configuration';
import { MinioService } from '../../lib';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  constructor(private readonly minio: MinioService) {
    this.logger = new Logger('MinioService');

    // THIS IS THE POLICY
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: ['*'],
          },
          Action: [
            's3:ListBucketMultipartUploads',
            's3:GetBucketLocation',
            's3:ListBucket',
          ],
          Resource: [`arn:aws:s3:::${configuration().minioBucket}`], // Change this according to your bucket name
        },
        {
          Effect: 'Allow',
          Principal: {
            AWS: ['*'],
          },
          Action: [
            's3:PutObject',
            's3:AbortMultipartUpload',
            's3:DeleteObject',
            's3:GetObject',
            's3:ListMultipartUploadParts',
          ],
          Resource: [`arn:aws:s3:::${configuration().minioBucket}/*`], // Change this according to your bucket name
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
        'Content-Encoding': 'base64',
        'Content-Type': 'image/webp',
      };
      const fileName = `${file.path}${hashedFileName}${extension}`;

      await new Promise<void>((resolve, reject) => {
        this.client.putObject(
          bucketName,
          fileName,
          buffer,
          metaData,
          (err: any) => {
            if (err) {
              reject(err);
              return;
            }

            resolve();
          },
        );
      });

      return {
        url: `${configuration().hostUrl}/statics/${fileName}`,
      };
    } catch (err) {
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }
  }

  async delete(objetName: string, bucketName: string = this.bucketName) {
    try {
      await new Promise<void>((resolve, reject) => {
        this.client.removeObject(bucketName, objetName, (err: any) => {
          if (err) {
            reject(err);
            return;
          }
          this.logger.log('File deleted successfully');
          resolve();
        });
      });
    } catch (error) {
      throw new HttpException(
        'An error occured when deleting!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
