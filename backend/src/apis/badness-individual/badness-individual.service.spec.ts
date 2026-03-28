import { Test, TestingModule } from '@nestjs/testing';
import { BadnessIndividualService } from './badness-individual.service';
import { mockPrismaService, mockStorageService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('BadnessIndividualService', () => {
  let service: BadnessIndividualService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadnessIndividualService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<BadnessIndividualService>(BadnessIndividualService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
