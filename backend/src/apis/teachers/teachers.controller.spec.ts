import { Test, TestingModule } from '@nestjs/testing';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { mockPrismaService, mockStorageService } from '@common/test/mocks';
import { PrismaService } from '@common/services/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('TeachersController', () => {
  let controller: TeachersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      providers: [
        TeachersService,
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

    controller = module.get<TeachersController>(TeachersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
