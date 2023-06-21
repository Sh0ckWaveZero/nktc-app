import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';


@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return await this.prisma.department.findMany({
      orderBy: [
        {
          name: 'asc',
        }
      ],
    });
  }
}
