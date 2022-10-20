import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class ClassroomService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return await this.prisma.classroom.findMany({
      include: {
        level: true,
        program: true,
      },
      orderBy: [
        {
          program: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ]
    });
  }

  async findByTeacherId(id: string) {
    const result = await this.prisma.teacher.findUniqueOrThrow({
      where: {
        id: id,
      },
      select: {
        classroomIds: true,
      }
    });


    return await this.prisma.classroom.findMany({
      where: {
        OR: result.classroomIds.map((item: any) => {
          return {
            id: item,
          }
        },)
      },
      orderBy: [
        {
          program: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ]
    });
  }
}
