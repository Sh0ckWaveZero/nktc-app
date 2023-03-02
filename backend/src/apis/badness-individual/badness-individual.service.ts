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
        const response = await this.minioService.upload({ data: body.image, path: 'goodness-individual/images/' });
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
        const response = await this.minioService.upload({ data: body.image, path: 'goodness-individual/images/' });
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

    const response = await this.prisma.badnessIndividual.findMany({
      where: filter,
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
      orderBy: [
        {
          createdAt: 'desc',
        }
      ],
    });

    return response;
  };
}
