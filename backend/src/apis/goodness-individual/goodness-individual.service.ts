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

  findAll() {
    return `This action returns all goodnessIndividual`;
  }

  findOne(id: number) {
    return `This action returns a #${id} goodnessIndividual`;
  }

  async findByStudentId(id: string) {
    return await this.prisma.goodnessIndividual.findMany({
      where: {
        studentId: id,
      },
    });
  };

  update(id: number, updateGoodnessIndividualDto: any) {
    return `This action updates a #${id} goodnessIndividual`;
  }

  remove(id: number) {
    return `This action removes a #${id} goodnessIndividual`;
  }
}
