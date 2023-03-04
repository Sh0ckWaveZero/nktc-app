import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { MinioClientService } from '../minio/minio-client.service';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService, private readonly minioService: MinioClientService) { }

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

    // get teacher on classroom
    const teacherOnClassroom = await this.prisma.teacherOnClassroom.findMany({
      where: {
        teacherId: {
          in: teachers.map((item: any) => {
            return item.teacher.id;
          }
          ),
        },
      },
    });

    const classrooms = await this.prisma.classroom.findMany({
      where: {
        OR: teacherOnClassroom.map((item: any) => {
          return {
            id: item.classroomId,
          }
        })
      }
    });

    return teachers.map((item: any) => {
      const teacherOnClassrooms = teacherOnClassroom
        .filter((el: any) => item.teacher.id === el.teacherId)
        .map((cl: any) => cl.classroomId);
      const classroomList = classrooms
        .filter((el: any) => teacherOnClassrooms.includes(el.id))
        .map((cl: any) => cl.name);
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
        teacherOnClassroom: teacherOnClassrooms,
        classrooms: classroomList,
      };
    })
  }

  async getCheckIn(id: string) {
    // get teacher on classroom
    const teacherOnClassroom = await this.prisma.teacherOnClassroom.findMany({
      where: {
        teacherId: id,
      },
      select: {
        classroomId: true,
      },
    });
    const classroomIds = teacherOnClassroom.map((item: any) => item.classroomId) ?? []

    const classrooms = await this.prisma.classroom.findMany({
      where: {
        OR: classroomIds.map((item: any) => {
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
          OR: classroomIds.map((item: any) => {
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
            status: true,
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
        classrooms: classrooms.map((item: any) => {
          return {
            id: item.id,
            classroomId: item.classroomId,
            name: item.name,
            students: students
              .filter((student: any) => student.student.classroomId === item.id)
              .map((student: any) => ({
                id: student.id,
                studentId: student.username,
                title: student.account.title,
                firstName: student.account.firstName,
                lastName: student.account.lastName,
                avatar: student.account.avatar,
                status: student.student.status,
              })),
          };
        }),
      },
    };
  }

  async updateClassroom(userId: string, updateTeacherDto: any) {
    const teacherOnClassroom = await this.prisma.teacherOnClassroom.findMany({
      where: {
        teacherId: updateTeacherDto.teacherInfo,
      },
    });

    if (teacherOnClassroom.length > 0) {
      await this.prisma.teacherOnClassroom.deleteMany({
        where: {
          teacherId: updateTeacherDto.teacherInfo,
        }
      });
    }

    const dataCreate = updateTeacherDto.classrooms.map((item: any) => ({
      teacherId: updateTeacherDto.teacherInfo,
      classroomId: item,
      createdBy: userId,
      updatedBy: userId,
    }));

    return await this.prisma.teacherOnClassroom.createMany({
      data: dataCreate,
    });
  }


  async updateProfile(userId: string, updateTeacherDto: any) {
    try {
      let avatar = '';
      if (updateTeacherDto?.avatar) {
        const { url } = await this.minioService.upload({ data: updateTeacherDto.avatar, path: 'avatars/teachers/' });
        avatar = url;
      }

      // update teacher
      const updateTeacher = await this.prisma.teacher.update({
        where: {
          id: updateTeacherDto.teacherInfo,
        },
        data: {
          jobTitle: updateTeacherDto.jobTitle,
          academicStanding: updateTeacherDto.academicStanding,
          departmentId: updateTeacherDto.department,
          updatedBy: userId,
        }
      });
      // update account
      const updateAccount = await this.prisma.account.update({
        where: {
          id: updateTeacherDto.accountId,
        },
        data: {
          title: updateTeacherDto.title,
          firstName: updateTeacherDto.firstName,
          lastName: updateTeacherDto.lastName,
          avatar: avatar,
          birthDate: updateTeacherDto.birthDate === '' ? null : updateTeacherDto.birthDate,
          idCard: updateTeacherDto.idCard,
          updatedBy: userId,
        }
      });

      // update classroom
      const updateClassroom = await this.updateClassroom(userId, updateTeacherDto);
      return {
        data: {
          updateClassroom,
          updateTeacher,
          updateAccount,
        }
      };
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
