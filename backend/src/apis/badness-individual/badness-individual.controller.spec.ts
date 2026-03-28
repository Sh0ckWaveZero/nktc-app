import { Test, TestingModule } from '@nestjs/testing';
import { BadnessIndividualController } from './badness-individual.controller';
import { BadnessIndividualService } from './badness-individual.service';
import { mockPrismaService, mockStorageService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('BadnessIndividualController', () => {
  let controller: BadnessIndividualController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BadnessIndividualController],
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

    controller = module.get<BadnessIndividualController>(
      BadnessIndividualController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
