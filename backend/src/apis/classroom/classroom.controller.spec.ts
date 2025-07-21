import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';
import { mockPrismaService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';

describe('ClassroomController', () => {
  let controller: ClassroomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassroomController],
      providers: [
        ClassroomService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<ClassroomController>(ClassroomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
