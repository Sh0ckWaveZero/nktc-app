import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { ccyFormat } from 'src/common/shared/util';

@Injectable()
export class ActivityCheckInService {
  constructor(private prisma: PrismaService) { }

  async create(createReportCheckInDto: Prisma.ReportCheckInCreateInput) {
    return await this.prisma.activityCheckInReport.create({
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



  async findOne(teachId: string, classroomId: string) {
    let startDate = new Date();
    let endDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return await this.prisma.activityCheckInReport.findFirst({
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
              // classrooms: true,
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
      const reportCheckIn = await this.prisma.activityCheckInReport.findFirst({
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
              ? 'absent' : 'none' : 'notCheckIn',
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

    const checkIn = await this.prisma.activityCheckInReport.findMany({
      where: {
        teacherId: teacherId,
        classroomId: classroomId,
      }
    });

    return await Promise.all(studentsInfo.map(student => {
      // find student in checkIn count present, absent, late, leave
      const present = checkIn.filter(checkIn => checkIn.present.some(present => present === student.id)).length ?? 0;
      const absent = checkIn.filter(checkIn => checkIn.absent.some(absent => absent === student.id)).length ?? 0;

      return {
        ...student,
        present: present,
        presentPercent: (present / checkIn.length * 100),
        absent: absent,
        absentPercent: (absent / checkIn.length * 100),
        checkInTotal: checkIn.length,
      }
    }));
  }

  async findDailyReportByAdmin(stat: string, end: string) {
    let startDate = new Date(stat);
    let endDate = new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // get all department
    const classrooms = await this.prisma.classroom.findMany({
      select: {
        id: true,
        name: true,
        level: {
          select: {
            id: true,
            levelName: true,
            levelFullName: true,
          }
        },
        department: {
          select: {
            id: true,
            departmentId: true,
            name: true,
          }
        }
      },
    });

    const nameNumberRegex = /^([^\d]+)(\d+\/\d+)-(.*)$/;
    const sortedClassrooms = classrooms.sort((a, b) => {
      const [, prefixA, numberA, suffixA] = a.name.match(nameNumberRegex);
      const [, prefixB, numberB, suffixB] = b.name.match(nameNumberRegex);

      if (prefixA === prefixB) {
        const [majorA, minorA] = numberA.split('/');
        const [majorB, minorB] = numberB.split('/');

        if (majorA === majorB) {
          if (minorA === minorB) {
            return suffixA.localeCompare(suffixB);
          }
          return Number(minorA) - Number(minorB);
        }
        return Number(majorA) - Number(majorB);
      }

      return prefixA.localeCompare(prefixB);
    });

    // sort by department.name asc
    const sortedClassroomsByDepartment = sortedClassrooms.sort((a, b) => {
      if (a.department.name === b.department.name) {
        return 0;
      }
      return a.department.name > b.department.name ? 1 : -1;
    });

    const students = await this.prisma.student.count();

    const checkIn = await Promise.all(sortedClassroomsByDepartment.map(async (classroom: any) => {
      const reportCheckIn = await this.prisma.activityCheckInReport.findFirst({
        where: {
          classroomId: classroom.id,
          checkInDate: {
            gte: startDate,
            lte: endDate
          },
        },
      });

      const checKInBy = await this.prisma.user.findFirst({
        where: {
          teacher: {
            id: reportCheckIn?.createdBy
          }
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
            }
          }
        }
      });

      // find student in checkIn count present, absent
      const present = reportCheckIn ? reportCheckIn.present.length : 0;
      const absent = reportCheckIn ? reportCheckIn.absent.length : 0;
      const total = present + absent;
      const presentPercentTotal = ccyFormat(present / (total) * 100);
      const absentPercentTotal = ccyFormat(absent / (total) * 100);

      return {
        ...classroom,
        present: present,
        presentPercent: presentPercentTotal,
        absent: absent,
        absentPercent: absentPercentTotal,
        total: total,
        checkInDate: reportCheckIn ? reportCheckIn.checkInDate : null,
        ...checKInBy ? { checkInBy: checKInBy } : null,
      }
    }));

    return {
      students: students,
      checkIn: checkIn,
    }
  }

  async updateDailyReport(checkInId: string, updateDailyReportDto: any) {
    return await this.prisma.activityCheckInReport.update({
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
        updatedBy: {
          set: updateDailyReportDto.updatedBy
        }
      }
    });
  }

  async remove(id: string) {
    return await this.prisma.activityCheckInReport.delete({
      where: {
        id: id
      }
    });
  }
}