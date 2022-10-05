import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

@Injectable()
export class ClassroomService {
  constructor(private prisma: PrismaService) { }

  create(createClassroomDto: CreateClassroomDto) {
    return 'This action adds a new classroom';
  }

  async findAll() {
    return await this.prisma.classroom.findMany({
      include: {
        level: true,
        program: true,
      },
      orderBy: [
        {
          program: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ]
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} classroom`;
  }

  async findByTeacherId(id: string) {
    const result = await this.prisma.teacher.findUniqueOrThrow({
      where: {
        id: id,
      },
      select: {
        classroomIds: true,
      }
    });


    return await this.prisma.classroom.findMany({
      where: {
        OR: result.classroomIds.map((item: any) => {
          return {
            id: item,
          }
        },)
      },
      orderBy: [
        {
          program: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ]
    });

  }

  update(id: number, updateClassroomDto: UpdateClassroomDto) {
    return `This action updates a #${id} classroom`;
  }

  remove(id: number) {
    return `This action removes a #${id} classroom`;
  }
}
