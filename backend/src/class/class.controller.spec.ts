import { Test, TestingModule } from '@nestjs/testing';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';

describe('ClassController', () => {
  let controller: ClassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassController],
      providers: [ClassService],
    }).compile();

    controller = module.get<ClassController>(ClassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
