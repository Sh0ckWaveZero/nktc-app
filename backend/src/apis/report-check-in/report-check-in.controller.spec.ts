import { Test, TestingModule } from '@nestjs/testing';
import { ReportCheckInController } from './report-check-in.controller';
import { ReportCheckInService } from './report-check-in.service';

describe('ReportCheckInController', () => {
  let controller: ReportCheckInController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportCheckInController],
      providers: [ReportCheckInService],
    }).compile();

    controller = module.get<ReportCheckInController>(ReportCheckInController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
