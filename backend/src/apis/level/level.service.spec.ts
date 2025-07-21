import { Test, TestingModule } from '@nestjs/testing';
import { LevelService } from './level.service';
import { mockPrismaService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';

describe('LevelService', () => {
  let service: LevelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LevelService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LevelService>(LevelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
