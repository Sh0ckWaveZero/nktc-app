import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { mockPrismaService, mockStorageService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('StudentsController', () => {
  let controller: StudentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        StudentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
