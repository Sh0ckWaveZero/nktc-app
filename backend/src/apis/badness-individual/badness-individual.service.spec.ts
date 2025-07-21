import { Test, TestingModule } from '@nestjs/testing';
import { BadnessIndividualService } from './badness-individual.service';
import { mockPrismaService, mockMinioClientService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';
import { MinioClientService } from '../minio/minio-client.service';

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
          provide: MinioClientService,
          useValue: mockMinioClientService,
        },
      ],
    }).compile();

    service = module.get<BadnessIndividualService>(BadnessIndividualService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
