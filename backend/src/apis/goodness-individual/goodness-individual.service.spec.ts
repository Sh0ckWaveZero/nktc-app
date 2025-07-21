import { Test, TestingModule } from '@nestjs/testing';
import { GoodnessIndividualService } from './goodness-individual.service';
import { mockPrismaService, mockMinioClientService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';
import { MinioClientService } from '../minio/minio-client.service';

describe('GoodnessIndividualService', () => {
  let service: GoodnessIndividualService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<GoodnessIndividualService>(GoodnessIndividualService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
