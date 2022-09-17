import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';

describe('ClassroomController', () => {
  let controller: ClassroomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassroomController],
      providers: [ClassroomService],
    }).compile();

    controller = module.get<ClassroomController>(ClassroomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
