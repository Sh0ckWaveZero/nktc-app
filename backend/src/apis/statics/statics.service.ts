import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class StaticsService {
  constructor(private readonly minioService: StorageService) {}

  async getAvatar(bucketName: string, id: string) {
    return await this.minioService.client.getObject(bucketName, id);
  }
}
