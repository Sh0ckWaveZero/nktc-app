import { PrismaService as PrismaMongoDbService } from '../../common/services/prisma-mongodb.service';
import { Injectable } from '@nestjs/common';
import { AppBarSearchType } from './dto/types';

@Injectable()
export class AppBarService {
  constructor(private prisma: PrismaMongoDbService) {}

  async search(q = ''): Promise<AppBarSearchType[]> {
    const queryLowered = q.toLowerCase();
    const searchData = await this.prisma.appbar.findMany({
      where: {
        OR: [
          {
            url: {
              contains: queryLowered,
            },
          },
          {
            title: {
              contains: queryLowered,
            },
          },
          {
            category: {
              contains: queryLowered,
            },
          },
        ],
      },
    });

    return searchData;
  }
}
