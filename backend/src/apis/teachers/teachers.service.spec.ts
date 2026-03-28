import { Test, TestingModule } from '@nestjs/testing';
import { TeachersService } from './teachers.service';
import { mockPrismaService, mockStorageService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';
import { StorageService } from '../storage/storage.service';

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
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
