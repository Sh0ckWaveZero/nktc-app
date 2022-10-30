import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class StudentsService {

  constructor(
    private prisma: PrismaService
  ) { }

  async findByClassroomId(id: string) {
    console.log("🚀 ~ file: students.service.ts ~ line 12 ~ StudentsService ~ findByClassroomId ~ id", id)
    return await this.prisma.user.findMany({
      where: {
        student: {
          classroomId: id,
        }
      },
      select: {
        id: true,
        username: true,
        student: {
          select: {
            id: true,
            studentId: true,
            classroomId: true,
            departmentId: true,
            programId: true,
            levelId: true,
            levelClassroomId: true,
            stutus: true,
            classroom: {
              select: {
                name: true,
              }
            }
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
  }
}
