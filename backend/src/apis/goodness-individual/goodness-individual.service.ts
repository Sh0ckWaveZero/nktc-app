import { Injectable } from '@nestjs/common';

import { MinioClientService } from '../minio/minio-client.service';
import { PrismaService } from 'src/common/services/prisma.service';

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

    const sortCondition = query?.sort && query?.sort?.length > 0 ? query?.sort : [{ field: 'createdAt', sort: 'desc' }];

    const response = await this.prisma.goodnessIndividual.findMany({
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

    const total = await this.prisma.goodnessIndividual.count({ where: filter }) || 0;

    return {
      data: response,
      total,
    };
  };
}
