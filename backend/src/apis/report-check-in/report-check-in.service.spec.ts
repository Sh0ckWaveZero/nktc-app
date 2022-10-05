import { Test, TestingModule } from '@nestjs/testing';
import { ReportCheckInService } from './report-check-in.service';

describe('ReportCheckInService', () => {
  let service: ReportCheckInService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportCheckInService],
    }).compile();

    service = module.get<ReportCheckInService>(ReportCheckInService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
