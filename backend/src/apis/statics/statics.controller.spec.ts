import { Test, TestingModule } from '@nestjs/testing';
import { StaticsController } from './statics.controller';
import { StaticsService } from './statics.service';
import { mockMinioClientService } from '@common/test/mocks';
import { MinioClientService } from '../minio/minio-client.service';

describe('StaticsController', () => {
  let controller: StaticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaticsController],
      providers: [
        StaticsService,
        {
          provide: MinioClientService,
          useValue: mockMinioClientService,
        },
      ],
    }).compile();

    controller = module.get<StaticsController>(StaticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
