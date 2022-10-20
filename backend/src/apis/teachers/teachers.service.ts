import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) { }

  async findAll(q = '') {
    const [firstName, lastName] = q.split(' ');
    const teachers = await this.prisma.user.findMany({
      where: {
        role: 'Teacher',
        OR: [
          {
            account: {
              firstName: {
                contains: firstName,
              },
            },
          },
          {
            account: {
              lastName: {
                contains: lastName ? lastName : firstName,
              },
            },
          }
        ],
      },
      orderBy: [
        {
          username: 'asc',
        }
      ],
      include: {
        account: true,
        teacher: true,
      },
    });

    return teachers.map((item: any) => {
      return {
        id: item.id,
        username: item.username,
        email: item.email ?? '',
        role: item.role,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        updatedBy: item.updatedBy,
        createdBy: item.createdBy,
        accountId: item.account.id,
        avatar: item.account.avatar ?? '',
        title: item.account.title,
        firstName: item.account.firstName,
        lastName: item.account.lastName,
        teacherId: item.teacher.id,
        jobTitle: item.teacher.jobTitle ?? '',
        academicStanding: item.teacher.academicStanding ?? '',
        programId: item.teacher.programId ?? [],
        departmentId: item.teacher.departmentId ?? [],
        levelClassroomId: item.teacher.levelClassroomId ?? [],
        classroomIds: item.teacher.classroomIds ?? [],
        status: item.teacher.status ?? '',
      };
    })
  }

  async getCheckIn(id: string) {
    const classrooms = await this.prisma.teacher.findUniqueOrThrow({
      where: {
        id: id,
      },
      select: {
        classroomIds: true,
      }
    });

    const classroom = await this.prisma.classroom.findMany({
      where: {
        OR: classrooms.classroomIds.map((item: any) => {
          return {
            id: item,
          }
        })
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
      select: {
        id: true,
        classroomId: true,
        name: true,
      },
    });

    const students = await this.prisma.user.findMany({
      where: {
        student: {
          OR: classrooms.classroomIds.map((item: any) => {
            return {
              classroomId: item,
            }
          })
        }
      },
      select: {
        id: true,
        username: true,
        student: {
          select: {
            classroomId: true,
          }
        },
        account: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        }
      },
      orderBy: [
        {
          account: {
            firstName: 'asc',
          },
        },
        {
          account: {
            lastName: 'asc',
          },
        },
      ]
    });

    return {
      data: {
        classrooms: classroom.map((item: any) => {
          return {
            id: item.id,
            classroomId: item.classroomId,
            name: item.name,
            students: students.filter((student: any) => {
              return student.student.classroomId === item.id;
            }).map((student: any) => {
              return {
                id: student.id,
                studentId: student.username,
                title: student.account.title,
                firstName: student.account.firstName,
                lastName: student.account.lastName,
                avatar: student.account.avatar,
              }
            }),
          }
        }),
      }
    };
  }

  async updateClassroom(id: string, updateTeacherDto: any) {
    const updated = await this.prisma.teacher.update({
      where: {
        userId: id,
      },
      data: {
        classroomIds: updateTeacherDto.classrooms,
      }
    });
    return updated;
  }
}
