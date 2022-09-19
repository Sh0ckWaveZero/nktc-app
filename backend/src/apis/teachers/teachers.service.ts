import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) { }

  create(createTeacherDto: CreateTeacherDto) {
    return 'This action adds a new teacher';
  }

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

  findOne(id: number) {
    return `This action returns a #${id} teacher`;
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

  remove(id: number) {
    return `This action removes a #${id} teacher`;
  }
}
