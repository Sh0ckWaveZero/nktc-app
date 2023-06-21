import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return await this.prisma.program.findMany({
      orderBy: {
        name: 'asc',
      }
    });
  }
}
