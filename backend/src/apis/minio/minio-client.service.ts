import * as crypto from 'crypto';

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { MinioService } from 'nestjs-minio-client';
import configuration from '../../config/configuration';

@Injectable()
export class MinioClientService {
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
    this.client.setBucketPolicy(
      configuration().minioBucket,
      JSON.stringify(policy),
      function (err: any) {
        if (err) throw err;

        console.log('Bucket policy set');
      },
    );

  }

  private readonly logger: Logger;
  private readonly bucketName = configuration().minioBucket

  public get client() {
    return this.minio.client;
  }

  public async upload(file: any, bucketName: string = this.bucketName) {
    const buffer = Buffer.from(file?.data.replace(/^data:image\/\w+;base64,/, ""), 'base64')
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

    // We need to append the extension at the end otherwise Minio will save it as a generic file
    const fileName = file.path + hashedFileName + extension;

    this.client.putObject(
      bucketName,
      fileName,
      buffer,
      metaData,
      (err: any, res: any) => {
        if (err) {
          throw new HttpException(
            'Error uploading file',
            HttpStatus.BAD_REQUEST,
          );
        }
      },
    );

    return {
      url: `${configuration().hostUrl}/statics/${fileName}`,
    };
  }

  async delete(objetName: string, bucketName: string = this.bucketName) {
    this.client.removeObject(bucketName, objetName, (err: any) => {
      if (err)
        throw new HttpException(
          'An error occured when deleting!',
          HttpStatus.BAD_REQUEST,
        );
    });
  }
}