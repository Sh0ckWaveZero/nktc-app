import { Test, TestingModule } from '@nestjs/testing';
import { GoodnessIndividualService } from './goodness-individual.service';

describe('GoodnessIndividualService', () => {
  let service: GoodnessIndividualService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoodnessIndividualService],
    }).compile();

    service = module.get<GoodnessIndividualService>(GoodnessIndividualService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
