import { Test, TestingModule } from '@nestjs/testing';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';

describe('ProgramsController', () => {
  let controller: ProgramsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramsController],
      providers: [ProgramsService],
    }).compile();

    controller = module.get<ProgramsController>(ProgramsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
