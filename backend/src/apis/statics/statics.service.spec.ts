import { Test, TestingModule } from '@nestjs/testing';
import { StaticsService } from './statics.service';
import { mockMinioClientService } from '@common/test/mocks';
import { MinioClientService } from '../minio/minio-client.service';

describe('StaticsService', () => {
  let service: StaticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticsService,
        {
          provide: MinioClientService,
          useValue: mockMinioClientService,
        },
      ],
    }).compile();

    service = module.get<StaticsService>(StaticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
