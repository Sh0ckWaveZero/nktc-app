import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { MinioClientService } from '../minio/minio-client.service';

@Injectable()
export class BadnessIndividualService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioClientService,
  ) { }
  async create(body: any) {

    let image: any = '';
    try {
      if (body.image) {
        const response = await this.minioService.upload({ data: body.image, path: 'badness-individual/images/' });
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
        const response = await this.minioService.upload({ data: body.image, path: 'badness-individual/images/' });
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

    if (query.badDate) {
      let startDate = new Date(query.badDate);
      let endDate = new Date(query.badDate);
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

    const sortCondition = query?.sort && query?.sort?.length > 0 ? query?.sort : [{ field: 'createdAt', sort: 'desc' }];

    const response = await this.prisma.badnessIndividual.findMany({
      where: filter,
      skip: query.skip || 0,
      take: query.take || 1000,
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

    const total = await this.prisma.badnessIndividual.count({ where: filter }) || 0;

    return {
      data: response,
      total,
    };
  };


  /**
  / ฟังก์ชัน async สำหรับการดึงข้อมูลสรุปคะแนนความประพฤติจากฐานข้อมูล
  / @param {Object} query - อ็อบเจกต์ที่มีค่าคุณลักษณะต่างๆ เพื่อกำหนดการดึงข้อมูล
  /@returns {Object} - อ็อบเจกต์ที่มีข้อมูลสรุปคะแนนความประพฤติของนักเรียนและจำนวนทั้งหมด
  */
  async getBadnessSummary(query: any): Promise<{ data: any, total: number }> {
    // ดึงข้อมูลนักเรียนที่มีคะแนนความประพฤติจากฐานข้อมูล
    const selectedStudents = await this.prisma.badnessIndividual.findMany({
      skip: query.skip || 0,
      take: query.take || 1000,
      select: {
        studentKey: true,
      },
      distinct: ['studentKey'],
    });
    // กำหนดเงื่อนไขการเรียงลำดับข้อมูล
    const sortCondition = query?.sort && query?.sort?.length > 0 ? query?.sort : [{ field: 'createdAt', sort: 'desc' }];
    // ดึงข้อมูลคะแนนความประพฤติของนักเรียนที่เลือกและข้อมูลเกี่ยวกับนักเรียนและชั้นเรียน
    const filteredBadnessIndividual = await this.prisma.badnessIndividual.findMany({
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
    // สรุปคะแนนความประพฤติของนักเรียน
    const summarizedStudents = Object.values(filteredBadnessIndividual.reduce((acc: any, cur: any) => {
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
          firstName: title + firstName + ' ' + lastName,
          name
        };
      }
      return acc;
    }, {}));
    // เรียงลำดับคะแนนความประพฤติของนักเรียน
    summarizedStudents.sort((a: any, b: any) => b.badnessScore - a.badnessScore);

    // กำหนดลำดับเลขนักเรียนในการแสดงผล
    let runningNumber = query.skip === 0 ? 1 : query.skip + 1;

    // เพิ่มลำดับเลขนักเรียนในข้อมูลสรุปคะแนนความประพฤติ
    const summaryWithRunningNumber = summarizedStudents.map((student: any) => {
      return {
        ...student,
        runningNumber: runningNumber++
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
          info: filteredBadnessIndividual.filter((gi: any) => gi.studentId === item.studentId).map((gi: any) => {
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
}
