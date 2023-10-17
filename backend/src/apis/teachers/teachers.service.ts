import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { MinioClientService } from '../minio/minio-client.service';
import { isValidHttpUrl, isEmpty } from '../../utils/utils';

@Injectable()
export class TeachersService {
  constructor(
    private prisma: PrismaService,
    private readonly minioService: MinioClientService,
  ) {}

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
          },
        ],
      },
      orderBy: [
        {
          username: 'asc',
        },
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
          }),
        },
      },
    });

    const classrooms = await this.prisma.classroom.findMany({
      where: {
        OR: teacherOnClassroom.map((item: any) => {
          return {
            id: item.classroomId,
          };
        }),
      },
    });

    // audit log
    const login = await this.prisma.auditLog.findMany({
      where: {
        createdBy: {
          in: teachers.map((item: any) => {
            return item.username;
          }),
        },
        action: 'Login',
      },
    });

    // This function takes in a list of logins and returns the number of logins per user per day.
    const loginCount = login.reduce((acc: any, item: any) => {
      const date = new Date(item.createdAt).toLocaleDateString();
      if (acc[item.createdBy]) {
        if (acc[item.createdBy][date]) {
          acc[item.createdBy][date] = acc[item.createdBy][date] + 1;
        } else {
          acc[item.createdBy][date] = 1;
        }
      } else {
        acc[item.createdBy] = {};
        acc[item.createdBy][date] = 1;
      }
      return acc;
    }, {});

    return teachers.map((teacher: any) => {
      const teacherOnClassrooms = teacherOnClassroom
        .filter((el: any) => teacher.teacher.id === el.teacherId)
        .map((cl: any) => cl.classroomId);
      const classroomList = classrooms
        .filter((el: any) => teacherOnClassrooms.includes(el.id))
        .map((cl: any) => cl.name);

      const loginCountByUserSummary = loginCount[teacher.username]
        ? Object.keys(loginCount[teacher.username]).map((key: any) => {
            return {
              date: key,
              count: loginCount[teacher.username][key],
            };
          })
        : [];

      return {
        id: teacher.id,
        username: teacher.username,
        email: teacher.email ?? '',
        role: teacher.role,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt,
        updatedBy: teacher.updatedBy,
        createdBy: teacher.createdBy,
        accountId: teacher.account.id,
        avatar: teacher.account.avatar ?? '',
        title: teacher.account.title,
        birthDate: teacher?.account?.birthDate ?? null,
        firstName: teacher.account.firstName,
        lastName: teacher.account.lastName,
        teacherId: teacher.teacher.id,
        jobTitle: teacher.teacher.jobTitle ?? '',
        academicStanding: teacher.teacher.academicStanding ?? '',
        programId: teacher.teacher.programId ?? [],
        departmentId: teacher.teacher.departmentId ?? [],
        levelClassroomId: teacher.teacher.levelClassroomId ?? [],
        classroomIds: teacher.teacher.classroomIds ?? [],
        status: teacher.teacher.status ?? '',
        teacherOnClassroom: teacherOnClassrooms,
        classrooms: classroomList,
        loginCountByUser: loginCountByUserSummary,
      };
    });
  }

  async getStudentsByTeacherId(id: string) {
    // get teacher on classroom
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

    const classrooms = await this.prisma.classroom.findMany({
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
            };
          }),
        },
      },
      select: {
        id: true,
        username: true,
        student: {
          select: {
            classroomId: true,
            status: true,
          },
        },
        account: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            avatar: true,
            addressLine1: true,
            subdistrict: true,
            district: true,
            province: true,
            postcode: true,
          },
        },
      },
      orderBy: [
        {
          student: {
            studentId: 'asc',
          },
        },
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
      ],
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
                account: {
                  addressLine1: student.account.addressLine1,
                  subdistrict: student.account.subdistrict,
                  district: student.account.district,
                  province: student.account.province,
                  postcode: student.account.postcode,
                },
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
        },
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
        const isUrl = isValidHttpUrl(updateTeacherDto.avatar);
        if (isUrl) {
          avatar = updateTeacherDto.avatar;
        } else {
          const { url } = await this.minioService.upload({
            data: updateTeacherDto.avatar,
            path: 'avatars/teachers/',
          });
          avatar = url;
        }
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
        },
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
          birthDate:
            updateTeacherDto.birthDate === ''
              ? null
              : updateTeacherDto.birthDate,
          idCard: updateTeacherDto.idCard,
          updatedBy: userId,
        },
      });

      // update classroom
      const updateClassroom = await this.updateClassroom(
        userId,
        updateTeacherDto,
      );
      return {
        data: {
          updateClassroom,
          updateTeacher,
          updateAccount,
        },
      };
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async update(id: string, data: any) {
    console.log(
      '🚀 ~ file: teachers.service.ts:329 ~ TeachersService ~ update ~ id:',
      id,
    );
    console.log(
      '🚀 ~ file: teachers.service.ts:329 ~ TeachersService ~ update ~ data:',
      data,
    );
    try {
      // find teacher
      const teacherInfo = await this.prisma.teacher.findUnique({
        where: {
          id: id,
        },
      });
      console.log(
        '🚀 ~ file: teachers.service.ts:338 ~ TeachersService ~ update ~ teacherInfo:',
        isEmpty(teacherInfo),
      );

      if (isEmpty(teacherInfo)) {
        throw new NotFoundException('Teacher not found');
      }

      // update teacher
      const teacher = await this.prisma.teacher.update({
        where: {
          id: id,
        },
        data: {
          jobTitle: data?.teacher?.jobTitle,
          status: data?.teacher?.status,
        },
      });

      // update account
      const account = await this.prisma.account.update({
        where: {
          id: data?.account?.id,
        },
        data: {
          firstName: data?.teacher?.firstName,
          lastName: data?.teacher?.lastName,
          birthDate:
            data?.teacher?.birthDate === '' ? null : data?.teacher?.birthDate,
          idCard: data?.teacher?.idCard,
          updatedBy: data?.user?.id,
        },
      });

      return teacher && account ? true : false;
    } catch (error: any) {
      console.error(error);
      return error;
    }
  }

  async addTeacher(data: any) {
    try {
      const user = await this.prisma.user.create({
        data: {
          username: data?.teacher?.username,
          password: data?.teacher?.password,
          role: data?.teacher?.role,
          account: {
            create: {
              firstName: data?.teacher?.firstName,
              lastName: data?.teacher?.lastName,
              idCard: data?.teacher?.idCard,
              birthDate:
                data?.teacher?.birthDate === ''
                  ? null
                  : data?.teacher?.birthDate,
              createdBy: data?.user?.id,
              updatedBy: data?.user?.id,
            },
          },
          teacher: {
            create: {
              jobTitle: data?.teacher?.jobTitle,
              status: data?.teacher?.status || 'true',
              createdBy: data?.user?.id,
              updatedBy: data?.user?.id,
            },
          },
          createdBy: data?.user?.id,
          updatedBy: data?.user?.id,
        },
      });
      return user;
    } catch (error: any) {
      console.error(error);
      return error;
    }
  }

  async deleteTeacher(id: string) {
    // find user
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (isEmpty(user)) {
      throw new NotFoundException('User not found');
    }

    // delete user
    const deleteUser = await this.prisma.user.delete({
      where: {
        id: id,
      },
    });

    return deleteUser;
  }
}
