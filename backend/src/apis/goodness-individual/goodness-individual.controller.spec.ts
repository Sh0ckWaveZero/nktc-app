import { Test, TestingModule } from '@nestjs/testing';
import { GoodnessIndividualController } from './goodness-individual.controller';
import { GoodnessIndividualService } from './goodness-individual.service';

describe('GoodnessIndividualController', () => {
  let controller: GoodnessIndividualController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoodnessIndividualController],
      providers: [GoodnessIndividualService],
    }).compile();

    controller = module.get<GoodnessIndividualController>(GoodnessIndividualController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
