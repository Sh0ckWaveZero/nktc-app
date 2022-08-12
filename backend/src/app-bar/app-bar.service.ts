import { PrismaService as PrismaMongoDbService } from './../prisma/prisma-mongodb.service';
import { Injectable, Query } from "@nestjs/common";
import { SearchData } from './db';
import { CreateAppBarDto } from './dto/create-app-bar.dto';
import { UpdateAppBarDto } from './dto/update-app-bar.dto';
import { AppBarSearchType } from './dto/types';

@Injectable()
export class AppBarService {
  constructor(private prisma: PrismaMongoDbService) { }

  async search(q: string = ''): Promise<AppBarSearchType[]> {
    const queryLowered = q.toLowerCase();

    const searchData = await this.prisma.appbar.findMany({
      where: {
        OR: [
          {
            url: {
              contains: queryLowered
            }
          },
          {
            title: {
              contains: queryLowered
            }
          },
          {
            category: {
              contains: queryLowered
            }
          }
        ]
      }
    });

    return searchData;
  }
}
