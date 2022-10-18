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

  async findDailyReport(teacherId: string, classroomId: string, date: string) {
    let startDate = new Date(date);
    let endDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const user = await this.prisma.user.findFirstOrThrow(
      {
        where: {
          teacher: {
            id: teacherId
          },
        },
        select: {
          id: true,
          username: true,
          account: {
            select: {
              id: true,
              title: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          teacher: {
            select: {
              id: true,
              teacherId: true,
              jobTitle: true,
              academicStanding: true,
              classrooms: true,
              status: true,
            },
          },
        }
      });

    const classrooms = await this.prisma.classroom.findMany({
      where: {
        id: classroomId,
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

    return await Promise.all(classrooms.map(async (classroom: any) => {
      const reportCheckIn = await this.prisma.reportCheckIn.findFirst({
        where: {
          teacherId: teacherId,
          classroomId: classroom.id,
          checkInDate: {
            gte: startDate,
            lte: endDate
          },
        },
      });

      // get all student in classroom
      const studentsInfo = await this.prisma.user.findMany({
        where: {
          student: {
            classroomId: classroom.id,
          }
        },
        select: {
          id: true,
          username: true,
          student: {
            select: {
              id: true,
              studentId: true,
            }
          },
          account: {
            select: {
              id: true,
              title: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          }
        },
        orderBy: [
          {
            account: {
              firstName: 'asc',
            },
          },
          {
            account: {
              lastName: 'asc',
            },
          },
        ]
      });

      const students = studentsInfo.map(student => {
        return {
          ...student,
          checkInStatus: reportCheckIn ? reportCheckIn.present.some(present => present === student.id)
            ? 'present'
            : reportCheckIn.absent.some(absent => absent === student.id)
              ? 'absent'
              : reportCheckIn.late.some(late => late === student.id)
                ? 'late'
                : reportCheckIn.leave.some(leave => leave === student.id) ? 'leave' : 'none' : 'notCheckIn',
          teacher: user,
        }
      });

      return {
        ...classroom,
        reportCheckIn: reportCheckIn ?? null,
        students: students ?? null,
      }
    })
    );
  }

  async findSummaryReport(teacherId: string, classroomId: string) {
    // get all student in classroom
    const studentsInfo = await this.prisma.user.findMany({
      where: {
        student: {
          classroomId: classroomId,
        }
      },
      select: {
        id: true,
        username: true,
        student: {
          select: {
            id: true,
            studentId: true,
          }
        },
        account: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        }
      },
      orderBy: [
        {
          account: {
            firstName: 'asc',
          },
        },
        {
          account: {
            lastName: 'asc',
          },
        },
      ]
    });

    const checkIn = await this.prisma.reportCheckIn.findMany({
      where: {
        teacherId: teacherId,
        classroomId: classroomId,
      }
    });

    return await Promise.all(studentsInfo.map(student => {
      // find student in checkIn count present, absent, late, leave
      const present = checkIn.filter(checkIn => checkIn.present.some(present => present === student.id)).length ?? 0;
      const absent = checkIn.filter(checkIn => checkIn.absent.some(absent => absent === student.id)).length ?? 0;
      const late = checkIn.filter(checkIn => checkIn.late.some(late => late === student.id)).length ?? 0;
      const leave = checkIn.filter(checkIn => checkIn.leave.some(leave => leave === student.id)).length ?? 0;

      return {
        ...student,
        present: present,
        presentPercent: (present / checkIn.length * 100).toFixed(2),
        absent: absent,
        absentPercent: (absent / checkIn.length * 100).toFixed(2),
        late: late,
        latePercent: (late / checkIn.length * 100).toFixed(2),
        leave: leave,
        leavePercent: (leave / checkIn.length * 100).toFixed(2),
        checkInTotal: checkIn.length,
      }
    }));
  }

  async updateDailyReport(checkInId: string, updateDailyReportDto: any) {
    return await this.prisma.reportCheckIn.update({
      where: {
        id: checkInId,
      },
      data: {
        present: {
          set: updateDailyReportDto.present
        },
        absent: {
          set: updateDailyReportDto.absent
        },
        late: {
          set: updateDailyReportDto.late
        },
        leave: {
          set: updateDailyReportDto.leave
        },
        updatedBy: {
          set: updateDailyReportDto.updatedBy
        }
      }
    });
  }

  update(id: number, updateReportCheckInDto: UpdateReportCheckInDto) {
    return `This action updates a #${id} reportCheckIn`;
  }

  async remove(id: string) {
    return await this.prisma.reportCheckIn.delete({
      where: {
        id: id
      }
    });
  }
}