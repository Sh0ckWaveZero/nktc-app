import { Test, TestingModule } from '@nestjs/testing';
import { BadnessIndividualController } from './badness-individual.controller';
import { BadnessIndividualService } from './badness-individual.service';
import { mockPrismaService, mockMinioClientService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';
import { MinioClientService } from '../minio/minio-client.service';

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
          provide: MinioClientService,
          useValue: mockMinioClientService,
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
