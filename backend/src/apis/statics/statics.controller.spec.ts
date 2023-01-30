import { Test, TestingModule } from '@nestjs/testing';
import { StaticsController } from './statics.controller';
import { StaticsService } from './statics.service';

describe('StaticsController', () => {
  let controller: StaticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaticsController],
      providers: [StaticsService],
    }).compile();

    controller = module.get<StaticsController>(StaticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
