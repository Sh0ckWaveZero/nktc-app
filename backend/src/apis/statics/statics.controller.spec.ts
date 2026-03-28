import { Test, TestingModule } from '@nestjs/testing';
import { StaticsController } from './statics.controller';
import { StaticsService } from './statics.service';
import { mockStorageService } from '@common/test/mocks';
import { StorageService } from '../storage/storage.service';

describe('StaticsController', () => {
  let controller: StaticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaticsController],
      providers: [
        StaticsService,
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    controller = module.get<StaticsController>(StaticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
