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
    this.client.setBucketPolicy(
      configuration().minioBucket,
      JSON.stringify(policy),
    ).then(() => {
      console.log('Bucket policy set');
    }).catch((err: any) => {
      throw err;
    });
  }

  private readonly bucketName = configuration().minioBucket;

  public get client() {
    return this.minio.client;
  }

  /**
   * Process file data from base64 format
   * @param fileData Base64 encoded file data
   * @returns Buffer of the processed file
   */
  private processFileBuffer(fileData: string): Buffer {
    try {
      return Buffer.from(
        fileData.replace(/^data:.*?;base64,/, ''),
        'base64',
      );
    } catch (error) {
      this.logger.error(`Failed to process file buffer: ${error.message}`);
      throw new HttpException('Invalid file format', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Generate a unique file name using timestamp and hash
   * @param path The file path
   * @param extension File extension including the dot
   * @returns Generated file name
   */
  private generateFileName(path: string, extension: string): string {
    const timestamp = Date.now().toString();
    const hashedFileName = crypto
      .createHash('md5')
      .update(timestamp)
      .digest('hex');

    return `${path}${hashedFileName}${extension}`;
  }

  /**
   * Determine file metadata based on file type
   * @param contentType MIME type of the file
   * @returns Metadata object for MinIO
   */
  private getFileMetadata(contentType: string): Record<string, string> {
    return {
      'Content-Encoding': 'base64',
      'Content-Type': contentType || 'application/octet-stream',
    };
  }

  /**
   * Upload a file to MinIO bucket
   * @param file File object with data and metadata
   * @param bucketName Target bucket name (optional)
   * @returns Object with the URL of the uploaded file
   */
  public async upload(file: any, bucketName: string = this.bucketName) {
    if (!file || !file.data) {
      throw new HttpException('Missing file data', HttpStatus.BAD_REQUEST);
    }

    try {
      const contentType = file.contentType || 'image/webp';
      const extension = file.extension || '.webp';
      const buffer = this.processFileBuffer(file.data);
      const fileName = this.generateFileName(file.path || '', extension);
      const metaData = this.getFileMetadata(contentType);

      try {
        // Upload the file to MinIO
        const size = buffer.length;
        await this.client.putObject(bucketName, fileName, buffer, size, metaData);
        this.logger.log(`File ${fileName} uploaded successfully to bucket ${bucketName}`);

        return {
          url: `${configuration().hostUrl}/statics/${fileName}`,
          fileName,
        };
      } catch (uploadError) {
        this.logger.error(`MinIO upload failed: ${uploadError.message}`);
        throw new HttpException(
          `Failed to upload file: ${uploadError.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.logger.error(`File upload error: ${err.message}`);
      throw new HttpException(
        'Error processing file for upload',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async delete(objectName: string, bucketName: string = this.bucketName) {
    try {
      await this.client.removeObject(bucketName, objectName);
      this.logger.log(`File ${objectName} deleted successfully from bucket ${bucketName}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file ${objectName}: ${error.message}`);
      throw new HttpException(
        'An error occurred when deleting!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
