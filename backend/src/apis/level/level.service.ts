import { Injectable } from '@nestjs/common';
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
