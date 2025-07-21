import { Test, TestingModule } from '@nestjs/testing';
import { TeachersService } from './teachers.service';
import { mockPrismaService, mockMinioClientService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';
import { MinioClientService } from '../minio/minio-client.service';

describe('TeachersService', () => {
  let service: TeachersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
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

    service = module.get<TeachersService>(TeachersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
