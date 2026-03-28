import { Test, TestingModule } from '@nestjs/testing';
import { StaticsService } from './statics.service';
import { mockStorageService } from '@common/test/mocks';
import { StorageService } from '../storage/storage.service';

describe('StaticsService', () => {
  let service: StaticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticsService,
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<StaticsService>(StaticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
