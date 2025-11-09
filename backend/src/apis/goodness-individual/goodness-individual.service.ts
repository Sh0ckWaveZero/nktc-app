import { Injectable, NotFoundException } from '@nestjs/common';

import { MinioClientService } from '../minio/minio-client.service';
import { PrismaService } from '../../common/services/prisma.service';
import configuration from '../../config/configuration';

@Injectable()
export class GoodnessIndividualService {
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
          path: 'goodness-individual/images/',
        });
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
          path: 'goodness-individual/images/',
        });
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
    try {
      const filter: any = {};

    if (query.fullName) {
        const nameParts = query.fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        if (firstName && lastName) {
          // Both first and last name - use AND
          filter['student'] = {
            user: {
              account: {
                AND: [
                  {
                    firstName: {
                      contains: firstName,
                    },
                  },
                  {
                    lastName: {
                      contains: lastName,
                    },
                  },
                ],
              },
            },
          };
        } else if (firstName) {
          // Only first name
        filter['student'] = {
          user: {
            account: {
              firstName: {
                contains: firstName,
              },
            },
          },
        };
        } else if (lastName) {
          // Only last name
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

    if (query.goodDate) {
        // Handle date string format (YYYY-MM-DD) or Date object
        let dateValue: Date;
        if (typeof query.goodDate === 'string') {
          // If it's a date string (YYYY-MM-DD), parse it in local timezone
          const dateMatch = query.goodDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (dateMatch) {
            const [, year, month, day] = dateMatch.map(Number);
            dateValue = new Date(year, month - 1, day);
          } else {
            dateValue = new Date(query.goodDate);
          }
        } else {
          dateValue = new Date(query.goodDate);
        }

        // Validate date
        if (isNaN(dateValue.getTime())) {
          throw new Error('Invalid date format');
        }

        const startDate = new Date(dateValue);
      startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(dateValue);
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

      // If no students found, return empty result
      if (!selectedStudents || selectedStudents.length === 0) {
        return {
          data: [],
          total: 0,
        };
      }

    // กำหนดเงื่อนไขการเรียงลำดับข้อมูล
    const sortCondition =
      query?.sort && query?.sort?.length > 0
        ? query?.sort
        : [{ field: 'createdAt', sort: 'desc' }];
    // ดึงข้อมูลคะแนนความดีของนักเรียนที่เลือกและข้อมูลเกี่ยวกับนักเรียนและชั้นเรียน
    const filteredGoodnessIndividual =
      await this.prisma.goodnessIndividual.findMany({
        where: {
            studentKey: {
              in: selectedStudents.map((item: any) => item.studentKey),
              },
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
    // สรุปคะแนนความดีของนักเรียน
    const summarizedStudents = Object.values(
      filteredGoodnessIndividual.reduce((acc: any, cur: any) => {
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
            title,
            firstName: `${firstName} ${lastName}`.trim(),
            name,
          };
        }
        return acc;
      }, {}),
    );
    // เรียงลำดับคะแนนความดีของนักเรียน
    summarizedStudents.sort(
      (a: any, b: any) => b.goodnessScore - a.goodnessScore,
    );

    // กำหนดลำดับเลขนักเรียนในการแสดงผล
    let runningNumber = query.skip === 0 ? 1 : query.skip + 1;

    // เพิ่มลำดับเลขนักเรียนในข้อมูลสรุปคะแนนความดี
    const summaryWithRunningNumber = summarizedStudents.map((student: any) => {
      return {
        ...student,
        runningNumber: runningNumber++,
      };
    });

    // ดึงข้อมูลนักเรียนที่มีคะแนนความดีจากฐานข้อมูลเพื่อนับจำนวนทั้งหมด
    const totalSelectedStudents = await this.prisma.goodnessIndividual.findMany(
      {
        select: {
            studentKey: true,
        },
          distinct: ['studentKey'],
      },
    );

    // ส่งข้อมูลสรุปคะแนนความดีของนักเรียนและจำนวนทั้งหมดกลับไปยังผู้ใช้งาน
    return {
      data: summaryWithRunningNumber.map((item: any) => {
        return {
          ...item,
          info: filteredGoodnessIndividual
            .filter((gi: any) => gi.studentId === item.studentId)
            .map((gi: any) => {
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
    } catch (error: any) {
      console.error('Error in goodness-individual search:', error);
      throw error;
    }
  }

  /**
  / ฟังก์ชัน async สำหรับการดึงข้อมูลสรุปคะแนนความดีจากฐานข้อมูล
  / @param {Object} query - อ็อบเจกต์ที่มีค่าคุณลักษณะต่างๆ เพื่อกำหนดการดึงข้อมูล
  /@returns {Object} - อ็อบเจกต์ที่มีข้อมูลสรุปคะแนนความดีของนักเรียนและจำนวนทั้งหมด
  */
  async getGoodnessSummary(query: any): Promise<{ data: any; total: number }> {
    // กำหนดเงื่อนไขการเรียงลำดับข้อมูล
    const sortCondition =
      query?.sort && query?.sort?.length > 0
        ? query?.sort
        : [{ field: 'createdAt', sort: 'desc' }];
    // ดึงข้อมูลคะแนนความดีของนักเรียนที่เลือกและข้อมูลเกี่ยวกับนักเรียนและชั้นเรียน
    const filteredGoodnessIndividual =
      await this.prisma.goodnessIndividual.findMany({
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

    // สรุปคะแนนความดีของนักเรียน
    const summarizedStudents = Object.values(
      filteredGoodnessIndividual.reduce((acc: any, cur: any) => {
        const { id, studentId, goodnessScore } = cur;
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
            title,
            firstName: `${firstName} ${lastName}`.trim(),
            name,
          };
        }
        return acc;
      }, {}),
    );

    // เรียงลำดับคะแนนความดีของนักเรียน
    summarizedStudents.sort(
      (a: any, b: any) => b.goodnessScore - a.goodnessScore,
    );

    const skip = query.skip || 0;
    const take = query.take || 1000;

    // กำหนดขอบเขตของข้อมูลที่จะแสดงผล
    const studentsScope = summarizedStudents.slice(skip, skip + take);

    // กำหนดลำดับเลขนักเรียนในการแสดงผล
    let runningNumber = query.skip === 0 ? 1 : query.skip + 1;

    // เพิ่มลำดับเลขนักเรียนในข้อมูลสรุปคะแนนความดี
    const summaryWithRunningNumber = studentsScope.map((student: any) => {
      return {
        ...student,
        runningNumber: runningNumber++,
      };
    });

    // ดึงข้อมูลนักเรียนที่มีคะแนนความดีจากฐานข้อมูลเพื่อนับจำนวนทั้งหมด
    const totalSelectedStudents = await this.prisma.goodnessIndividual.findMany(
      {
        select: {
          studentKey: true,
        },
        distinct: ['studentKey'],
      },
    );

    // ส่งข้อมูลสรุปคะแนนความดีของนักเรียนและจำนวนทั้งหมดกลับไปยังผู้ใช้งาน
    return {
      data: summaryWithRunningNumber.map((item: any) => {
        return {
          ...item,
          info: filteredGoodnessIndividual
            .filter((gi: any) => gi.studentId === item.studentId)
            .map((gi: any) => {
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
      await this.minioService.delete(objectName);
    }

    const deletedGoodnessIndividual =
      await this.prisma.goodnessIndividual.delete({
        where: {
          id: id,
        },
      });
    return !!deletedGoodnessIndividual;
  }

  async findGoodnessIndividual(
    id: string,
    skip: number,
    take: number,
  ): Promise<{ data: any; total: number }> {
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
    const totalSelectedStudents = await this.prisma.goodnessIndividual.findMany(
      {
        where: {
          studentKey: id,
        },
      },
    );

    return {
      data: selectedStudents || [],
      total: totalSelectedStudents.length ? totalSelectedStudents.length : 0,
    };
  }
}
