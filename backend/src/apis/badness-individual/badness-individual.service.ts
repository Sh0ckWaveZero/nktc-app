import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { MinioClientService } from '../minio/minio-client.service';
import configuration from '../../config/configuration';

@Injectable()
export class BadnessIndividualService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioClientService,
  ) {}
  async create(body: any) {
    let image: any = '';
    try {
      if (body.image) {
        const response = await this.minioService.upload({
          data: body.image,
          path: 'badness-individual/images/',
        });
        image = response?.url;
      }

      const response = await this.prisma.badnessIndividual.create({
        data: {
          studentId: body.studentId,
          badnessDetail: body.badnessDetail,
          badnessScore: Number(body.badnessScore),
          image: image,
          badDate: body.badDate || null,
          createdBy: body.createdBy,
          updatedBy: body.updatedBy,
          student: {
            connect: { id: body.studentKey },
          },
          classroom: {
            connect: { id: body.classroomId },
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
        const response = await this.minioService.upload({
          data: body.image,
          path: 'badness-individual/images/',
        });
        image = response?.url;
      }
      const response = await this.prisma.badnessIndividual.createMany({
        data: body.students.map((student: any) => ({
          studentId: student.studentId,
          badnessDetail: body.badnessDetail,
          badnessScore: Number(body.badnessScore),
          image: image,
          badDate: body.badDate || null,
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
          user: {
            account: {
              firstName: {
                contains: firstName,
              },
            },
          },
        };
      }

      if (lastName) {
        filter['student'] = {
          user: {
            account: {
              lastName: {
                contains: lastName,
              },
            },
          },
        };
      }
    }

    if (query.classroomId) {
      filter['classroom'] = {
        id: query.classroomId,
      };
    }

    if (query.badDate) {
      const startDate = new Date(query.badDate);
      const endDate = new Date(query.badDate);
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

    const selectedStudents = await this.prisma.badnessIndividual.findMany({
      where: filter,
      skip: query.skip || 0,
      take: query.take || 1000,
      select: {
        studentKey: true,
      },
      distinct: ['studentKey'],
    });

    // กำหนดเงื่อนไขการเรียงลำดับข้อมูล
    const sortCondition =
      query?.sort && query?.sort?.length > 0
        ? query?.sort
        : [{ field: 'createdAt', sort: 'desc' }];
    // ดึงข้อมูลคะแนนความประพฤติของนักเรียนที่เลือกและข้อมูลเกี่ยวกับนักเรียนและชั้นเรียน
    const filteredBadnessIndividual =
      await this.prisma.badnessIndividual.findMany({
        where: {
          OR: [
            {
              studentKey: {
                in: selectedStudents.map((item: any) => item.studentKey),
              },
            },
          ],
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
                    },
                  },
                },
              },
            },
          },
          classroom: true,
        },
        orderBy: sortCondition.map(({ field, sort }) => ({ [field]: sort })),
      });

    // สรุปคะแนนความประพฤติของนักเรียน
    const summarizedStudents = Object.values(
      filteredBadnessIndividual.reduce((acc: any, cur: any) => {
        const { studentId, badnessScore, studentKey } = cur;
        const { title, firstName, lastName } = cur.student.user.account;
        const { name } = cur.classroom;
        const key = studentId;
        if (acc[key]) {
          acc[key].badnessScore += badnessScore;
        } else {
          acc[key] = {
            id: studentKey,
            studentId,
            badnessScore,
            fullName: title + firstName + ' ' + lastName,
            name,
          };
        }
        return acc;
      }, {}),
    );
    // เรียงลำดับคะแนนความประพฤติของนักเรียน
    summarizedStudents.sort(
      (a: any, b: any) => b.badnessScore - a.badnessScore,
    );

    // กำหนดลำดับเลขนักเรียนในการแสดงผล
    let runningNumber = query.skip === 0 ? 1 : query.skip + 1;

    // เพิ่มลำดับเลขนักเรียนในข้อมูลสรุปคะแนนความประพฤติ
    const summaryWithRunningNumber = summarizedStudents.map((student: any) => {
      return {
        ...student,
        runningNumber: runningNumber++,
      };
    });

    // ดึงข้อมูลนักเรียนที่มีคะแนนความประพฤติจากฐานข้อมูลเพื่อนับจำนวนทั้งหมด
    const totalSelectedStudents = await this.prisma.badnessIndividual.findMany({
      select: {
        studentKey: true,
      },
      distinct: ['studentKey'],
    });

    // ส่งข้อมูลสรุปคะแนนความประพฤติของนักเรียนและจำนวนทั้งหมดกลับไปยังผู้ใช้งาน
    return {
      data: summaryWithRunningNumber.map((item: any) => {
        return {
          ...item,
          info: filteredBadnessIndividual
            .filter((gi: any) => gi.studentId === item.studentId)
            .map((gi: any) => {
              return {
                id: gi.id,
                badnessDetail: gi.badnessDetail,
                badnessScore: gi.badnessScore,
                badDate: gi.badDate,
                image: gi.image,
              };
            }),
        };
      }),
      total: totalSelectedStudents.length || 0,
    };
  }

  /**
  / ฟังก์ชัน async สำหรับการดึงข้อมูลสรุปคะแนนความประพฤติจากฐานข้อมูล
  / @param {Object} query - อ็อบเจกต์ที่มีค่าคุณลักษณะต่างๆ เพื่อกำหนดการดึงข้อมูล
  /@returns {Object} - อ็อบเจกต์ที่มีข้อมูลสรุปคะแนนความประพฤติของนักเรียนและจำนวนทั้งหมด
  */
  async getBadnessSummary(query: any): Promise<{ data: any; total: number }> {
    // กำหนดเงื่อนไขการเรียงลำดับข้อมูล
    const sortCondition =
      query?.sort && query?.sort?.length > 0
        ? query?.sort
        : [{ field: 'createdAt', sort: 'desc' }];
    // ดึงข้อมูลคะแนนความประพฤติของนักเรียนที่เลือกและข้อมูลเกี่ยวกับนักเรียนและชั้นเรียน
    const filteredBadnessIndividual =
      await this.prisma.badnessIndividual.findMany({
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
                    },
                  },
                },
              },
            },
          },
          classroom: true,
        },
        orderBy: sortCondition.map(({ field, sort }) => ({ [field]: sort })),
      });
    // สรุปคะแนนความประพฤติของนักเรียน
    const summarizedStudents = Object.values(
      filteredBadnessIndividual.reduce((acc: any, cur: any) => {
        const { id, studentId, badnessScore } = cur;
        const { title, firstName, lastName } = cur.student.user.account;
        const { name } = cur.classroom;
        const key = studentId;
        if (acc[key]) {
          acc[key].badnessScore += badnessScore;
        } else {
          acc[key] = {
            id: id,
            studentId,
            badnessScore,
            firstName: title + firstName + ' ' + lastName,
            name,
          };
        }
        return acc;
      }, {}),
    );
    // เรียงลำดับคะแนนความประพฤติของนักเรียน
    summarizedStudents.sort(
      (a: any, b: any) => b.badnessScore - a.badnessScore,
    );

    const skip = query.skip || 0;
    const take = query.take || 1000;

    // กำหนดขอบเขตของข้อมูลที่จะแสดงผล
    const studentsScope = summarizedStudents.slice(skip, skip + take);

    // กำหนดลำดับเลขนักเรียนในการแสดงผล
    let runningNumber = query.skip === 0 ? 1 : query.skip + 1;

    // เพิ่มลำดับเลขนักเรียนในข้อมูลสรุปคะแนนความประพฤติ
    const summaryWithRunningNumber = studentsScope.map((student: any) => {
      return {
        ...student,
        runningNumber: runningNumber++,
      };
    });

    // ดึงข้อมูลนักเรียนที่มีคะแนนความประพฤติจากฐานข้อมูลเพื่อนับจำนวนทั้งหมด
    const totalSelectedStudents = await this.prisma.badnessIndividual.findMany({
      select: {
        studentKey: true,
      },
      distinct: ['studentKey'],
    });

    // ส่งข้อมูลสรุปคะแนนความประพฤติของนักเรียนและจำนวนทั้งหมดกลับไปยังผู้ใช้งาน
    return {
      data: summaryWithRunningNumber.map((item: any) => {
        return {
          ...item,
          info: filteredBadnessIndividual
            .filter((gi: any) => gi.studentId === item.studentId)
            .map((gi: any) => {
              return {
                id: gi.id,
                badnessDetail: gi.badnessDetail,
                badnessScore: gi.badnessScore,
                badDate: gi.badDate,
                image: gi.image,
              };
            }),
        };
      }),
      total: totalSelectedStudents.length || 0,
    };
  }

  async deleteById(id: string): Promise<boolean> {
    // find the BadnessIndividual
    const badnessIndividual = await this.prisma.badnessIndividual.findUnique({
      where: {
        id: id,
      },
    });

    // check if the BadnessIndividual exists
    if (!badnessIndividual) {
      throw new NotFoundException('BadnessIndividual not found');
    }

    // delete the image
    if (badnessIndividual.image) {
      const fileName = `${configuration().hostUrl}/statics/`;
      const objectName = badnessIndividual.image.replace(fileName, '');
      await this.minioService.delete(objectName);
    }

    const deletedGoodnessIndividual =
      await this.prisma.badnessIndividual.delete({
        where: {
          id: id,
        },
      });
    return !!deletedGoodnessIndividual;
  }

  async findBadnessIndividual(
    id: string,
    skip: number,
    take: number,
  ): Promise<{ data: any; total: number }> {
    const selectedStudents = await this.prisma.badnessIndividual.findMany({
      where: {
        studentKey: id,
      },
      skip: skip || 0,
      take: take || 100,
      orderBy: {
        badDate: 'desc',
      },
    });

    // total
    const totalSelectedStudents = await this.prisma.badnessIndividual.findMany({
      where: {
        studentKey: id,
      },
    });

    return {
      data: selectedStudents || [],
      total: totalSelectedStudents.length ? totalSelectedStudents.length : 0,
    };
  }
}
