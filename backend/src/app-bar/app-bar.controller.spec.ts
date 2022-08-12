import { Test, TestingModule } from '@nestjs/testing';
import { AppBarController } from './app-bar.controller';
import { AppBarService } from './app-bar.service';

describe('AppBarController', () => {
  let controller: AppBarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppBarController],
      providers: [AppBarService],
    }).compile();

    controller = module.get<AppBarController>(AppBarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
