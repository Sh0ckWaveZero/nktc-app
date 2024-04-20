import { Test, TestingModule } from '@nestjs/testing';
import { StaticsService } from './statics.service';
import { MinioClientService } from '../minio/minio-client.service';

describe('StaticsService', () => {
  let service: StaticsService;
  let minioClientService: MinioClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaticsService, MinioClientService],
    }).compile();

    service = module.get<StaticsService>(StaticsService);
    minioClientService = module.get<MinioClientService>(MinioClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
