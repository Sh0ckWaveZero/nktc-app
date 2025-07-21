import { Test, TestingModule } from '@nestjs/testing';
import { GoodnessIndividualController } from './goodness-individual.controller';
import { GoodnessIndividualService } from './goodness-individual.service';
import { mockPrismaService, mockMinioClientService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';
import { MinioClientService } from '../minio/minio-client.service';

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
          provide: MinioClientService,
          useValue: mockMinioClientService,
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
