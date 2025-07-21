import { Test, TestingModule } from '@nestjs/testing';
import { AppBarService } from './app-bar.service';
import { mockPrismaMongoDbService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma-mongodb.service';

describe('AppBarService', () => {
  let service: AppBarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppBarService,
        {
          provide: PrismaService,
          useValue: mockPrismaMongoDbService,
        },
      ],
    }).compile();

    service = module.get<AppBarService>(AppBarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
