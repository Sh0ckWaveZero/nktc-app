import { Test, TestingModule } from '@nestjs/testing';
import { BadnessIndividualService } from './badness-individual.service';

describe('BadnessIndividualService', () => {
  let service: BadnessIndividualService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BadnessIndividualService],
    }).compile();

    service = module.get<BadnessIndividualService>(BadnessIndividualService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
