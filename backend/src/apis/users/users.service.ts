import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { User, Role } from '../../database/generated/prisma/client/client';
import { PrismaService } from '../../common/services/prisma.service';
import { compare, hash } from 'bcrypt';
import { UpdatePasswordDto } from '@apis/auth/dto';

interface FormatLogin extends Partial<User> {
  id: string;
  username: string;
  role: Role;
  status: string | null;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const { password: _p, ...rest } = await this.prisma.user.findUnique({
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
            phone: true,
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

  async findByUsername(username: string) {
    const { password: _p, ...rest } = await this.prisma.user.findUnique({
      where: {
        username,
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
            phone: true,
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

  async updatePassword(payload: UpdatePasswordDto, id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const isValid = await compare(payload.currentPassword, user.password);

    if (!isValid) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        password: await hash(payload.newPassword, 12),
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

      // Hash password before storing
      const hashedPassword = await hash(payload?.teacher?.password || '', 12);

      const response = await this.prisma.user.update({
        where: { id },
        data: {
          password: hashedPassword,
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

    let newUser: {};
    try {
      newUser = await this.prisma.user.create({
        data: {
          ...userDto,
          password: await hash(userDto.password, 12),
        },
      });
    } catch (error) {
      throw new HttpException(
        "Can't create user",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return newUser;
  }

  //use by auth module to login user
  async login({ username, password }: any): Promise<FormatLogin> {
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

    if (!user) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    // get teacher on classroom
    let teacherOnClassroom = [];
    if (user.teacher) {
      teacherOnClassroom = await this.findTeacherOnClassroom(user.teacher.id);
    }

    // compare passwords
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    // remove password from user object
    const { password: _p, ...rest } = { ...user, teacherOnClassroom };
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
    let teacherOnClassroom = [];
    if (user.teacher) {
      teacherOnClassroom = await this.findTeacherOnClassroom(user.teacher.id);
    }

    // remove password from user object
    const { password: _p, ...rest } = { ...user, teacherOnClassroom };
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
    return teacherOnClassroom.map((item: any) => item.classroomId) ?? [];
  }

  async storeRefreshToken(userId: string, hashedToken: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }

  async verifyRefreshToken(userId: string, rawToken: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshToken) return false;
    return compare(rawToken, user.refreshToken);
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // getAuditLogs  params: username, skip, take
  async getAuditLogs(
    username: string,
    skip: number,
    take: number,
  ): Promise<any> {
    const teacher = await this.prisma.teacher.findUnique({
      where: {
        teacherId: username,
      },
    });

    let filter = {};

    if (teacher) {
      filter = {
        OR: [
          {
            createdBy: username,
          },
          {
            createdBy: teacher.id,
          },
        ],
      };
    } else {
      filter = {
        createdBy: username,
      };
    }

    const logs = await this.prisma.auditLog.findMany({
      where: filter,
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
