import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from 'src/common/services/prisma.service';
import { MinioClientService } from '../minio/minio-client.service';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private readonly minio: MinioClientService
  ) { }

  async findByClassroomId(id: string) {
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
            status: true,
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

  async createProfile(id: string, body: any) {


    const checkExisting = await this.prisma.student.findFirst({
      where: {
        studentId: body.studentId,
      }
    });

    if (checkExisting) {
      throw new Error('รหัสนักเรียนนี้มีอยู่ในระบบแล้ว');
    }

    const password = await hash(body.studentId.toString(), 12);

    await this.prisma.user.create({
      data: {
        username: body.studentId.toString(),
        password: password,
        role: 'Student',
        updatedBy: id,
        createdBy: id,
        account: {
          create: {
            title: body.title,
            firstName: body.firstName,
            lastName: body.lastName,
            birthDate: body.birthDate,
            idCard: body.idCard,
            addressLine1: body.addressLine1,
            subdistrict: body.subdistrict,
            district: body.district,
            province: body.province,
            postcode: body.postalCode,
            updatedBy: id,
            createdBy: id,
          }
        },
        student: {
          create: {
            studentId: body.studentId,
            classroomId: body.classroom,
            departmentId: body.department,
            programId: body.program,
            updatedBy: id,
            createdBy: id,
            levelId: body.level,
            levelClassroomId: body.levelClassroom,
          },
        }
      },
    });
    return {
      message: 'เพิ่มข้อมูลนักเรียนเรียบร้อยแล้ว',
    }
  }

  async updateProfile(id: string, body: any) {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        updatedBy: id,
        account: {
          update: {
            title: body.title,
            firstName: body.firstName,
            lastName: body.lastName,
            birthDate: body.birthDate,
            idCard: body.idCard,
            addressLine1: body.addressLine1,
            subdistrict: body.subdistrict,
            district: body.district,
            province: body.province,
            postcode: body.postalCode,
            updatedBy: id,
          }
        },
        student: {
          update: {
            classroomId: body.classroom,
            departmentId: body.department,
            programId: body.program,
            updatedBy: id,
          },
        }
      },
    });
  }

  deleteStudent(id: string) {
    // check if student has any related data
    const checkRelatedData = this.prisma.student.findFirst({
      where: {
        id,
      }
    });

    if (!checkRelatedData) {
      throw new Error('ไม่สามารถลบข้อมูลนักเรียนได้ เนื่องจากมีข้อมูลที่ไม่มีอยู่ในระบบแล้ว');
    }

    return this.prisma.user.delete({
      where: {
        id,
      }
    });
  }
}
