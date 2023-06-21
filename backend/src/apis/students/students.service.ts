import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from '../../common/services/prisma.service';
import { MinioClientService } from '../minio/minio-client.service';
import { isEmpty, isValidHttpUrl } from '../../utils/utils';

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

  async findWithParams(body: any) {
    try {
      const filter = {};

      if (body?.search?.fullName) {
        const [firstName, lastName] = body.search.fullName.split(' ');

        filter['account'] = {
          AND: [
            {
              firstName: {
                contains: firstName,
              },
            },
            {
              lastName: {
                contains: lastName ? lastName : firstName,
              },
            },
          ],
        };
      }

      if (body?.classroomId) {
        filter['student'] = {
          classroomId: body.classroomId,
        };
      }

      if (isEmpty(filter)) {
        return [];
      }

      const result = await this.prisma.user.findMany({
        where: filter,
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
        ]
      });

      return result;
    } catch (error) {
      return [];
    }
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
        const isUrl = isValidHttpUrl(body.avatar);
        if (isUrl) {
          avatar = body.avatar;
        } else {
          const { url } = await this.minioService.upload({ data: body.avatar, path: 'avatars/students/' });
          avatar = url;
        }
      }
      const res = await this.prisma.user.update({
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

      return res;
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

  async list(query: any) {
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

    if (query.classroomId) {
      filer['student'] = {
        ['classroomId']: {
          contains: query.classroomId,
        }
      };
    }

    const students = await this.prisma.user.findMany({
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
            classroom: {
              select: {
                id: true,
                name: true,
              }
            }
          },
        },
        account: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
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
      skip: 0,
      take: 20,
    });

    return students.map((student) => {
      return {
        fullName: `${student.account.firstName} ${student.account.lastName}`,
        title: student.account.title,
        id: student.student.id,
        studentId: student.username,
        classroom: student.student.classroom,
      }
    })
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

  async getTrophyOverview(id: string) {
    // get student goodness and badness
    const student = await this.prisma.student.findFirst({
      where: {
        id,
      },
      select: {
        goodnessIndividual: {
          select: {
            goodnessScore: true,
          },
        },
        badnessIndividual: {
          select: {
            badnessScore: true,
          }
        },
      },
    });

    const goodScore = student.goodnessIndividual.reduce((a, b) => a + b.goodnessScore, 0);
    const badScore = student.badnessIndividual.reduce((a, b) => a + b.badnessScore, 0);

    return {
      totalTrophy: Math.floor((goodScore - badScore) / 100),
      goodScore,
      badScore,
    };
  }

  async getTeacherClassroom(id: string) {
    const teacherIds = await this.prisma.teacherOnClassroom.findMany({
      where: {
        classroomId: id,
      },
      select: {
        teacherId: true,
      },
    });

    const teachers = await Promise.all(teacherIds.map((teacherId) => {
      return this.prisma.user.findFirst({
        where: {
          teacher: {
            id: teacherId.teacherId,
          },
        },
        select: {
          id: true,
          username: true,
          account: {
            select: {
              id: true,
              title: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
        }
      })
    }));

    return teachers;
  }
}
