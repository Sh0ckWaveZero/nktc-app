import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from 'src/common/services/prisma.service';
import { MinioClientService } from '../minio/minio-client.service';
import { isEmpty } from 'src/utils/utils';

@Injectable()
export class StudentsService {

  constructor(
    private prisma: PrismaService,
    private readonly minioService: MinioClientService
  ) { }

  async findBucket() {
    try {
      this.minioService.client.listBuckets(async (err, buckets) => {
        if (err)
          return console.log(err);
        console.log('buckets :', buckets);
        return buckets;
      });

      var data = []
      var stream = this.minioService.client.listObjects('nktc-app', '', true)
      stream.on('data', function (obj) { data.push(obj) })
      stream.on("end", function (obj) {
        console.log('data :', data);
        return data;
      })
      stream.on('error', function (err) { console.log(err) })

    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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
            phone: body.phone,
            updatedBy: id,
            createdBy: id,
          }
        },
        student: {
          create: {
            studentId: body.studentId,
            classroomId: body.classroom,
            status: body.status,
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
    let avatar: any = '';
    try {
      if (body.avatar) {
        const response = await this.minioService.upload({ data: body.avatar, path: 'avatars/students/' });
        avatar = response?.url;
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
                phone: body.phone,
                avatar: avatar,
              }
            },
            student: {
              update: {
                classroomId: body.classroom,
                departmentId: body.department,
                programId: body.program,
                status: body.status,
                updatedBy: id,
              },
            }
          },
        });
      }
    } catch (error) {
      return error;
    }
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

  async search(query: any) {
    const filer = {};
    if (query.fullName) {
      const [firstName, lastName] = query.fullName.split(' ');

      if (firstName) {
        filer['account'] = {
          ['firstName']: {
            contains: firstName,
          }
        };
      }

      if (lastName) {
        filer['account'] = {
          ['lastName']: {
            contains: lastName,
          }
        };
      }
    }

    if (query.studentId) {
      filer['username'] = { contains: query.studentId }
    }

    if (isEmpty(filer)) {
      return [];
    }

    return await this.prisma.user.findMany({
      where: {
        ...filer,
        role: 'Student',
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
            },
            goodnessIndividual: {
              select: {
                id: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc',
              }
            },
            badnessIndividual: {
              select: {
                id: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
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
      ],
    });
  }
}
