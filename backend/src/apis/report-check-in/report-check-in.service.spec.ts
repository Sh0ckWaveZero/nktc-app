import { Test, TestingModule } from '@nestjs/testing';
import { ReportCheckInService } from './report-check-in.service';
import { PrismaService } from 'src/common/services/prisma.service';

describe('ReportCheckInService', () => {
  let service: ReportCheckInService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportCheckInService, PrismaService],
    }).compile();

    service = module.get<ReportCheckInService>(ReportCheckInService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
