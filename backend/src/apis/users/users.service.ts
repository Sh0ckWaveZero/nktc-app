import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { compare, hash } from 'bcrypt';

interface FormatLogin extends Partial<User> {
  username: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findById(id: string) {
    const { password: p, ...rest } = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        account: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            avatar: true,
            birthDate: true,
            idCard: true,
            addressLine1: true,
            subdistrict: true,
            district: true,
            province: true,
            postcode: true,
          },
        },
        teacher: {
          select: {
            id: true,
            teacherId: true,
            jobTitle: true,
            academicStanding: true,
            classrooms: true,
            department: true,
            status: true,
          },
        },
        student: {
          include: {
            classroom: true,
            department: true,
            program: true,
          },
        },
      },
    });
    return rest;
  }

  async updatePassword(payload: any, id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException('invalid_credentials', HttpStatus.UNAUTHORIZED);
    }

    // compare password
    const isValid = await compare(payload.old_password, user.password);

    if (!isValid) {
      throw new HttpException('invalid_credentials', HttpStatus.UNAUTHORIZED);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        password: await hash(payload.new_password, 12),
      },
    });
  }

  // change password for admin
  async updatePasswordForAdmin(payload: any, id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        throw new HttpException('invalid_credentials', HttpStatus.UNAUTHORIZED);
      }

      const response = await this.prisma.user.update({
        where: { id },
        data: {
          password: payload?.teacher?.password,
          updatedAt: new Date(),
          updatedBy: payload?.user?.id,
        },
      });

      if (response) {
        // audit log
        return response;
      }

    } catch (error) {
      return error;
    }
  }


  async create(userDto: any): Promise<any> {
    // check if user already exists in database
    const user = await this.prisma.user.findFirst({
      where: { username: userDto.username },
    });

    if (user) {
      throw new HttpException('user_already_exists', HttpStatus.CONFLICT);
    }
    console.log(userDto.account);

    let newUser: {};
    try {
      newUser = await this.prisma.user.create({
        data: {
          ...userDto,
          password: await hash(userDto.password, 12),
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        "Can't create user",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return newUser;
  }

  //use by auth module to login user
  async login({ username, password, }: any): Promise<FormatLogin> {
    const user = await this.prisma.user.findFirst({
      where: { username },
      include: {
        account: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            avatar: true,
            birthDate: true,
          },
        },
        teacher: {
          select: {
            id: true,
            teacherId: true,
            jobTitle: true,
            academicStanding: true,
            classrooms: true,
            department: true,
            status: true,
          },
        },
        student: {
          include: {
            classroom: true,
          },
        },
      },
    });

    // check if user exist
    if (!user) {
      // throw new HttpException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
      // throw new Error('User not found');
      return Promise.resolve(null);
    }

    // get teacher on classroom
    let teacherOnClassroom = []
    if (user.teacher) {
      teacherOnClassroom = await this.findTeacherOnClassroom(user.teacher.id);
    }

    // compare passwords
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new HttpException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
    }

    // remove password from user object
    const { password: p, ...rest } = { ...user, teacherOnClassroom };
    return rest;
  }


  //use by auth module to get user in database
  async findByPayload({ username }: any): Promise<any> {
    return await this.prisma.user.findFirst({
      where: { username },
    });
  }

  async finedById(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            avatar: true,
            birthDate: true,
          },
        },
        teacher: {
          select: {
            id: true,
            teacherId: true,
            jobTitle: true,
            academicStanding: true,
            classrooms: true,
            department: true,
            status: true,
          },
        },
        student: {
          include: {
            classroom: true,
          },
        },
      },
    });

    // get teacher on classroom
    let teacherOnClassroom = []
    if (user.teacher) {
      teacherOnClassroom = await this.findTeacherOnClassroom(user.teacher.id);
    }

    // remove password from user object
    const { password: p, ...rest } = { ...user, teacherOnClassroom };
    return rest;
  }


  async findTeacherOnClassroom(teacherId: string): Promise<any> {
    const teacherOnClassroom = await this.prisma.teacherOnClassroom.findMany({
      where: {
        teacherId,
      },
      select: {
        classroomId: true,
      },
    });
    return teacherOnClassroom.map((item: any) => item.classroomId) ?? []
  }

  // getAuditLogs  params: username, skip, take
  async getAuditLogs(username: string, skip: number, take: number): Promise<any> {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        createdBy: username,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // get total
    const total = await this.prisma.auditLog.count({
      where: {
        createdBy: username,
      },
    });

    return {
      data: logs,
      total,
    };
  }
}