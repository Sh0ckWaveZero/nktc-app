import { Test, TestingModule } from '@nestjs/testing';
import { BadnessIndividualController } from './badness-individual.controller';
import { BadnessIndividualService } from './badness-individual.service';

describe('BadnessIndividualController', () => {
  let controller: BadnessIndividualController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BadnessIndividualController],
      providers: [BadnessIndividualService],
    }).compile();

    controller = module.get<BadnessIndividualController>(
      BadnessIndividualController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
