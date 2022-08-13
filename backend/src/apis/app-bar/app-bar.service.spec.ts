import { Test, TestingModule } from '@nestjs/testing';
import { AppBarService } from './app-bar.service';

describe('AppBarService', () => {
  let service: AppBarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppBarService],
    }).compile();

    service = module.get<AppBarService>(AppBarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
