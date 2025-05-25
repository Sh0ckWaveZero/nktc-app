import { Test, TestingModule } from '@nestjs/testing';
import { ReportCheckInService } from './report-check-in.service';
import { mockPrismaService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';

describe('ReportCheckInService', () => {
  let service: ReportCheckInService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportCheckInService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportCheckInService>(ReportCheckInService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
