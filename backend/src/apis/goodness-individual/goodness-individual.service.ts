import { Injectable, NotFoundException } from '@nestjs/common';

import { MinioClientService } from '../minio/minio-client.service';
import { PrismaService } from 'src/common/services/prisma.service';
import configuration from 'src/config/configuration';

@Injectable()
export class GoodnessIndividualService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioClientService,
  ) { }
  async create(body: any) {
    let image: any = '';
    try {
      if (body.image) {
        const response = await this.minioService.upload({ data: body.image, path: 'goodness-individual/images/' });
        image = response?.url;
      }

      const response = await this.prisma.goodnessIndividual.create({
        data: {
          studentId: body.studentId,
          goodnessDetail: body.goodnessDetail,
          goodnessScore: Number(body.goodnessScore),
          image: image,
          goodDate: body.goodDate || null,
          createdBy: body.createdBy,
          updatedBy: body.updatedBy,
          student: {
            connect: { id: body.studentKey }
          },
          classroom: {
            connect: { id: body.classroomId }
          },
        },
      });
      return response;
    } catch (error) {
      return error;
    }
  }

  async group(body: any) {

    let image: any = '';
    try {
      if (body.image) {
        const response = await this.minioService.upload({ data: body.image, path: 'goodness-individual/images/' });
        image = response?.url;
      }
      const response = await this.prisma.goodnessIndividual.createMany({
        data: body.students.map((student: any) => ({
          studentId: student.studentId,
          goodnessDetail: body.goodnessDetail,
          goodnessScore: Number(body.goodnessScore),
          image: image,
          goodDate: body.goodDate || null,
          createdBy: body.createdBy,
          updatedBy: body.updatedBy,
          studentKey: student.id,
          classroomId: student.classroom?.id,
        })),
      });
      return response;
    } catch (error) {
      return error;
    }
  }

  async search(query: any) {
    const filter = {};

    if (query.fullName) {
      const [firstName, lastName] = query.fullName.split(' ');

      if (firstName) {
        filter['student'] = {
          'user': {
            'account': {
              'firstName': {
                contains: firstName,
              },
            }
          },
        }
      }

      if (lastName) {
        filter['student'] = {
          'user': {
            'account': {
              'lastName': {
                contains: lastName,
              },
            }
          },
        }
      }
    }

    if (query.classroomId) {
      filter['classroom'] = {
        id: query.classroomId,
      }
    }

    if (query.goodDate) {
      let startDate = new Date(query.goodDate);
      let endDate = new Date(query.goodDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      filter['createdAt'] = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (query.studentId) {
      filter['studentKey'] = query.studentId;
    }

    const selectedStudents = await this.prisma.goodnessIndividual.findMany({
      where: filter,
      skip: query.skip || 0,
      take: query.take || 1000,
      select: {
        studentKey: true,
      },
      distinct: ['studentKey'],
    });


    // กำหนดเงื่อนไขการเรียงลำดับข้อมูล
    const sortCondition = query?.sort && query?.sort?.length > 0 ? query?.sort : [{ field: 'createdAt', sort: 'desc' }];
    // ดึงข้อมูลคะแนนความดีของนักเรียนที่เลือกและข้อมูลเกี่ยวกับนักเรียนและชั้นเรียน
    const filteredGoodnessIndividual = await this.prisma.goodnessIndividual.findMany({
      where: {
        OR: [
          {
            studentKey: {
              in: selectedStudents.map((item: any) => item.studentKey),
            },
          }
        ]
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                account: {
                  select: {
                    title: true,
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            }
          },
        },
        classroom: true,
      },
      orderBy: sortCondition.map(({ field, sort }) => ({ [field]: sort })),
    });
    // สรุปคะแนนความดีของนักเรียน
    const summarizedStudents = Object.values(filteredGoodnessIndividual.reduce((acc: any, cur: any) => {
      const { studentId, goodnessScore, studentKey } = cur;
      const { title, firstName, lastName } = cur.student.user.account;
      const { name } = cur.classroom;
      const key = studentId;
      if (acc[key]) {
        acc[key].goodnessScore += goodnessScore;
      } else {
        acc[key] = {
          id: studentKey,
          studentId,
          goodnessScore,
          firstName: title + firstName + ' ' + lastName,
          name
        };
      }
      return acc;
    }, {}));
    // เรียงลำดับคะแนนความดีของนักเรียน
    summarizedStudents.sort((a: any, b: any) => b.goodnessScore - a.goodnessScore);

    // กำหนดลำดับเลขนักเรียนในการแสดงผล
    let runningNumber = query.skip === 0 ? 1 : query.skip + 1;

    // เพิ่มลำดับเลขนักเรียนในข้อมูลสรุปคะแนนความดี
    const summaryWithRunningNumber = summarizedStudents.map((student: any) => {
      return {
        ...student,
        runningNumber: runningNumber++
      };
    });

    // ดึงข้อมูลนักเรียนที่มีคะแนนความดีจากฐานข้อมูลเพื่อนับจำนวนทั้งหมด
    const totalSelectedStudents = await this.prisma.goodnessIndividual.findMany({
      select: {
        studentKey: true,
      },
      distinct: ['studentKey'],
    });

    // ส่งข้อมูลสรุปคะแนนความดีของนักเรียนและจำนวนทั้งหมดกลับไปยังผู้ใช้งาน
    return {
      data: summaryWithRunningNumber.map((item: any) => {
        return {
          ...item,
          info: filteredGoodnessIndividual.filter((gi: any) => gi.studentId === item.studentId).map((gi: any) => {
            return {
              id: gi.id,
              goodnessDetail: gi.goodnessDetail,
              goodnessScore: gi.goodnessScore,
              goodDate: gi.goodDate,
              image: gi.image,
            };
          }),
        };
      }),
      total: totalSelectedStudents.length || 0,
    };
  };

  /**
  / ฟังก์ชัน async สำหรับการดึงข้อมูลสรุปคะแนนความดีจากฐานข้อมูล
  / @param {Object} query - อ็อบเจกต์ที่มีค่าคุณลักษณะต่างๆ เพื่อกำหนดการดึงข้อมูล
  /@returns {Object} - อ็อบเจกต์ที่มีข้อมูลสรุปคะแนนความดีของนักเรียนและจำนวนทั้งหมด
  */
  async getGoodnessSummary(query: any): Promise<{ data: any, total: number }> {
    // ดึงข้อมูลนักเรียนที่มีคะแนนความดีจากฐานข้อมูล
    const selectedStudents = await this.prisma.goodnessIndividual.findMany({
      skip: query.skip || 0,
      take: query.take || 1000,
      select: {
        studentKey: true,
      },
      distinct: ['studentKey'],
    });
    // กำหนดเงื่อนไขการเรียงลำดับข้อมูล
    const sortCondition = query?.sort && query?.sort?.length > 0 ? query?.sort : [{ field: 'createdAt', sort: 'desc' }];
    // ดึงข้อมูลคะแนนความดีของนักเรียนที่เลือกและข้อมูลเกี่ยวกับนักเรียนและชั้นเรียน
    const filteredGoodnessIndividual = await this.prisma.goodnessIndividual.findMany({
      where: {
        OR: [
          {
            studentKey: {
              in: selectedStudents.map((item: any) => item.studentKey),
            },
          }
        ]
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                account: {
                  select: {
                    title: true,
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            }
          },
        },
        classroom: true,
      },
      orderBy: sortCondition.map(({ field, sort }) => ({ [field]: sort })),
    });
    // สรุปคะแนนความดีของนักเรียน
    const summarizedStudents = Object.values(filteredGoodnessIndividual.reduce((acc: any, cur: any) => {
      const { id, studentId, goodnessScore, studentKey } = cur;
      const { title, firstName, lastName } = cur.student.user.account;
      const { name } = cur.classroom;
      const key = studentId;
      if (acc[key]) {
        acc[key].goodnessScore += goodnessScore;
      } else {
        acc[key] = {
          id: id,
          studentId,
          goodnessScore,
          firstName: title + firstName + ' ' + lastName,
          name
        };
      }
      return acc;
    }, {}));
    // เรียงลำดับคะแนนความดีของนักเรียน
    summarizedStudents.sort((a: any, b: any) => b.goodnessScore - a.goodnessScore);

    // กำหนดลำดับเลขนักเรียนในการแสดงผล
    let runningNumber = query.skip === 0 ? 1 : query.skip + 1;

    // เพิ่มลำดับเลขนักเรียนในข้อมูลสรุปคะแนนความดี
    const summaryWithRunningNumber = summarizedStudents.map((student: any) => {
      return {
        ...student,
        runningNumber: runningNumber++
      };
    });

    // ดึงข้อมูลนักเรียนที่มีคะแนนความดีจากฐานข้อมูลเพื่อนับจำนวนทั้งหมด
    const totalSelectedStudents = await this.prisma.goodnessIndividual.findMany({
      select: {
        studentKey: true,
      },
      distinct: ['studentKey'],
    });

    // ส่งข้อมูลสรุปคะแนนความดีของนักเรียนและจำนวนทั้งหมดกลับไปยังผู้ใช้งาน
    return {
      data: summaryWithRunningNumber.map((item: any) => {
        return {
          ...item,
          info: filteredGoodnessIndividual.filter((gi: any) => gi.studentId === item.studentId).map((gi: any) => {
            return {
              id: gi.id,
              goodnessDetail: gi.goodnessDetail,
              goodnessScore: gi.goodnessScore,
              goodDate: gi.goodDate,
              image: gi.image,
            };
          }),
        };
      }),
      total: totalSelectedStudents.length || 0,
    };
  }

  async deleteById(id: string): Promise<boolean> {
    // find the goodnessIndividual
    const goodnessIndividual = await this.prisma.goodnessIndividual.findUnique({
      where: {
        id: id,
      },
    });

    // check if the goodnessIndividual exists
    if (!goodnessIndividual) {
      throw new NotFoundException('GoodnessIndividual not found');
    }

    // delete the image
    if (goodnessIndividual.image) {
      const fileName = `${configuration().hostUrl}/statics/`;
      const objectName = goodnessIndividual.image.replace(fileName, '');
      await this.minioService.delete(objectName)
    }

    const deletedGoodnessIndividual = await this.prisma.goodnessIndividual.delete({
      where: {
        id: id,
      },
    });
    return !!deletedGoodnessIndividual;
  }

  async findGoodnessIndividual(id: string, skip: number, take: number): Promise<{ data: any, total: number }> {
    const selectedStudents = await this.prisma.goodnessIndividual.findMany({
      where: {
        studentKey: id,
      },
      skip: skip || 0,
      take: take || 100,
      orderBy: {
        goodDate: 'desc',
      },
    });

    // total
    const totalSelectedStudents = await this.prisma.goodnessIndividual.findMany({
      where: {
        studentKey: id,
      }
    });

    return {
      data: selectedStudents || [],
      total: totalSelectedStudents.length ? totalSelectedStudents.length : 0,
    };
  }
}
