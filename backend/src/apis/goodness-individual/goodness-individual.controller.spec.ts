import { Test, TestingModule } from '@nestjs/testing';
import { GoodnessIndividualController } from './goodness-individual.controller';
import { GoodnessIndividualService } from './goodness-individual.service';
import { mockPrismaService, mockStorageService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('GoodnessIndividualController', () => {
  let controller: GoodnessIndividualController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoodnessIndividualController],
      providers: [
        GoodnessIndividualService,
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

    controller = module.get<GoodnessIndividualController>(
      GoodnessIndividualController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
