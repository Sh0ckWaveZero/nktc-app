import { Injectable } from '@nestjs/common';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class LevelService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.level.findMany({
      select: {
        id: true,
        levelName: true,
      },
      orderBy: [
        {
          levelName: 'asc',
        },
      ],
    });
  }
}
