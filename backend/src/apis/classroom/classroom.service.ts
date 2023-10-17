import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { sortClassroomsByNumberAndDepartment } from '../../utils/utils';

@Injectable()
export class ClassroomService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.classroom.findMany({
      include: {
        level: true,
        program: true,
        department: true,
      },
      orderBy: [
        {
          department: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  async findByTeacherId(id: string) {
    const teacherOnClassroom = await this.prisma.teacherOnClassroom.findMany({
      where: {
        teacherId: id,
      },
      select: {
        classroomId: true,
      },
    });
    const classroomIds =
      teacherOnClassroom.map((item: any) => item.classroomId) ?? [];

    return await this.prisma.classroom.findMany({
      where: {
        OR: classroomIds.map((item: any) => {
          return {
            id: item,
          };
        }),
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
      ],
    });
  }

  async search(query: any) {
    const filter = {};
    if (query.name) {
      filter['name'] = {
        contains: query.name,
      };
    }

    // get classrooms and total count in one transaction
    const [classrooms, total] = await this.prisma.$transaction([
      this.prisma.classroom.findMany({
        where: filter,
        skip: query.skip || 0,
        take: query.take || 20,
        include: {
          level: true,
          program: true,
          department: true,
        },
        orderBy: [
          {
            department: {
              name: 'asc',
            },
          },
        ],
      }),
      this.prisma.classroom.count(),
    ]);

    // sort by department.name asc
    const sortedClassrooms = sortClassroomsByNumberAndDepartment(classrooms);

    return {
      data: sortedClassrooms || [],
      total: total,
    };
  }

  async create(data: any) {
    const {
      classroomId,
      name,
      levelId,
      classroomNumber,
      programId,
      departmentId,
      createdBy,
      updatedBy,
    } = data;
    const dateTimeInit = new Date();

    const classroom = await this.prisma.classroom.create({
      data: {
        classroomId,
        name,
        updatedAt: dateTimeInit,
        createdAt: dateTimeInit,
        createdBy: createdBy,
        updatedBy: updatedBy,
        level: {
          connect: {
            id: levelId,
          },
        },
        program: {
          connect: {
            id: programId,
          },
        },
        department: {
          connect: {
            id: departmentId,
          },
        },
      },
    });

    return classroom;
  }

  async deleteById(id: string) {
    try {
      return await this.prisma.classroom.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      return error;
    }
  }
}
