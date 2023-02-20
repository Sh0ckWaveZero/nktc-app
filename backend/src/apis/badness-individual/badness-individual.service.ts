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
}
