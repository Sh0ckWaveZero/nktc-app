import { Injectable } from '@nestjs/common';
import { MinioClientService } from '../minio/minio-client.service';

@Injectable()
export class StaticsService {
  constructor(private readonly minioService: MinioClientService) {}

  async getAvatar(bucketName: string, id: string) {
    return await this.minioService.client.getObject(bucketName, id);
  }
}
