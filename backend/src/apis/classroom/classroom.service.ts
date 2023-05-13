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
      ]
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
    const classroomIds = teacherOnClassroom.map((item: any) => item.classroomId) ?? []

    return await this.prisma.classroom.findMany({
      where: {
        OR: classroomIds.map((item: any) => {
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

  async search(query: any) {
    const filter = {};
    if (query.name) {
      filter['name'] = {
        contains: query.name,
      }
    }

    // กำหนดเงื่อนไขการเรียงลำดับข้อมูล
    const sortCondition = query?.sort && query?.sort?.length > 0 ? query?.sort : [{ field: 'name', sort: 'desc' }];

    const selectedClassrooms = await this.prisma.classroom.findMany({
      where: filter,
      skip: query.skip || 0,
      take: query.take || 20,
      include: {
        level: true,
        program: true,
        department: true,
      },
      orderBy: sortCondition.map(({ field, sort }) => ({ [field]: sort }))
    });

    const totalSelectedClassrooms = await this.prisma.classroom.findMany({});

    return {
      data: selectedClassrooms || [],
      total: totalSelectedClassrooms.length ? totalSelectedClassrooms.length : 0,
    };
  }

  async create(data: any) {
    const { classroomId, name, levelId, classroomNumber, programId, departmentId, createdBy, updatedBy } = data;
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
          }
        },
        program: {
          connect: {
            id: programId,
          }
        },
        department: {
          connect: {
            id: departmentId,
          }
        },
      }
    })

    return classroom;
  }

  async deleteById(id: string) {
    try {
      return await this.prisma.classroom.delete({
        where: {
          id: id,
        }
      });
    } catch (error) {
      return error;
    }
  }
};
