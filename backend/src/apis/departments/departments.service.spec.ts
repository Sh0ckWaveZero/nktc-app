import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { mockPrismaService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';

describe('DepartmentsService', () => {
  let service: DepartmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
