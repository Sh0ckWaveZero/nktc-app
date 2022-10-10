import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateReportCheckInDto } from './dto/create-report-check-in.dto';
import { UpdateReportCheckInDto } from './dto/update-report-check-in.dto';

@Injectable()
export class ReportCheckInService {

  constructor(private prisma: PrismaService) { }

  async create(createReportCheckInDto: Prisma.ReportCheckInCreateInput) {
    return await this.prisma.reportCheckIn.create({
      data: {
        ...createReportCheckInDto,
        createdBy: createReportCheckInDto.teacherId,
        updatedBy: createReportCheckInDto.teacherId,
        teacher: {
          connect: {
            id: createReportCheckInDto.teacherId
          }
        },
        classroom: {
          connect: {
            id: createReportCheckInDto.classroomId
          }
        }
      },
    });
  }

  findAll() {
    return `This action returns all reportCheckIn`;
  }

  async findOne(teachId: string, classroomId: string) {
    let startDate = new Date();
    let endDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return await this.prisma.reportCheckIn.findFirstOrThrow({
      where: {
        teacherId: teachId,
        classroomId: classroomId,
        checkInDate: {
          gte: startDate,
          lte: endDate
        },
      }
    });
  }

  update(id: number, updateReportCheckInDto: UpdateReportCheckInDto) {
    return `This action updates a #${id} reportCheckIn`;
  }

  remove(id: number) {
    return `This action removes a #${id} reportCheckIn`;
  }
}