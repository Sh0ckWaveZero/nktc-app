import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/services/prisma.service';
import { ccyFormat } from '../../common/shared/util';
import { sortClassroomsByNumberAndDepartment } from '../../utils/utils';

@Injectable()
export class ReportCheckInService {
  constructor(private prisma: PrismaService) {}

  async create(createReportCheckInDto: Prisma.ReportCheckInCreateInput) {
    const startDate = new Date(createReportCheckInDto.checkInDate);
    const endDate = new Date(createReportCheckInDto.checkInDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const reportCheckIn = await this.prisma.reportCheckIn.findFirst({
      where: {
        teacherId: createReportCheckInDto.teacherId,
        classroomId: createReportCheckInDto.classroomId,
        checkInDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (reportCheckIn) {
      // update
      return await this.prisma.reportCheckIn.update({
        where: {
          id: reportCheckIn.id,
        },
        data: {
          ...createReportCheckInDto,
          updatedBy: createReportCheckInDto.teacherId,
        },
      });
    }

    return await this.prisma.reportCheckIn.create({
      data: {
        ...createReportCheckInDto,
        createdBy: createReportCheckInDto.teacherId,
        updatedBy: createReportCheckInDto.teacherId,
        teacher: {
          connect: {
            id: createReportCheckInDto.teacherId,
          },
        },
        classroom: {
          connect: {
            id: createReportCheckInDto.classroomId,
          },
        },
      },
    });
  }

  async findOne(teachId: string, classroomId: string) {
    const startDate = new Date();
    const endDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return await this.prisma.reportCheckIn.findFirst({
      where: {
        teacherId: teachId,
        classroomId: classroomId,
        checkInDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  async findDailyReport(teacherId: string, classroomId: string, date: string) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // get teacher info
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        teacher: {
          id: teacherId,
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
      },
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
      ],
    });

    return await Promise.all(
      classrooms.map(async (classroom: any) => {
        const reportCheckIn = await this.prisma.reportCheckIn.findFirst({
          where: {
            teacherId: teacherId,
            classroomId: classroom.id,
            checkInDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        // get all student in classroom
        const studentsInfo = await this.prisma.user.findMany({
          where: {
            student: {
              classroomId: classroom.id,
            },
          },
          select: {
            id: true,
            username: true,
            student: {
              select: {
                id: true,
                studentId: true,
                status: true,
              },
            },
            account: {
              select: {
                id: true,
                title: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
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
          ],
        });

        const students = studentsInfo.map((student) => {
          return {
            ...student,
            checkInStatus: reportCheckIn
              ? reportCheckIn.present.some((present) => present === student.id)
                ? 'present'
                : reportCheckIn.absent.some((absent) => absent === student.id)
                ? 'absent'
                : reportCheckIn.late.some((late) => late === student.id)
                ? 'late'
                : reportCheckIn.leave.some((leave) => leave === student.id)
                ? 'leave'
                : reportCheckIn.internship.some(
                    (internship) => internship === student.id,
                  )
                ? 'internship'
                : 'none'
              : 'notCheckIn',
            teacher: user,
          };
        });

        return {
          ...classroom,
          reportCheckIn: reportCheckIn ?? null,
          students: students ?? null,
        };
      }),
    );
  }

  async findSummaryReport(teacherId: string, classroomId: string) {
    // get all student in classroom
    const studentsInfo = await this.prisma.user.findMany({
      where: {
        student: {
          classroomId: classroomId,
        },
      },
      select: {
        id: true,
        username: true,
        student: {
          select: {
            id: true,
            studentId: true,
          },
        },
        account: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
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
      ],
    });

    const checkIn = await this.prisma.reportCheckIn.findMany({
      where: {
        teacherId: teacherId,
        classroomId: classroomId,
      },
    });

    return await Promise.all(
      studentsInfo.map(async (student) => {
        const presentCount = checkIn.filter((checkIn) =>
          checkIn.present.some((present) => present === student.id),
        ).length;
        const absentCount = checkIn.filter((checkIn) =>
          checkIn.absent.some((absent) => absent === student.id),
        ).length;
        const lateCount = checkIn.filter((checkIn) =>
          checkIn.late.some((late) => late === student.id),
        ).length;
        const leaveCount = checkIn.filter((checkIn) =>
          checkIn.leave.some((leave) => leave === student.id),
        ).length;
        const internshipCount = checkIn.filter((checkIn) =>
          checkIn.internship.some((internship) => internship === student.id),
        ).length;

        const presentPercent = (presentCount / checkIn.length) * 100;
        const absentPercent = (absentCount / checkIn.length) * 100;
        const latePercent = (lateCount / checkIn.length) * 100;
        const leavePercent = (leaveCount / checkIn.length) * 100;
        const internshipPercent = (internshipCount / checkIn.length) * 100;

        return {
          ...student,
          present: presentCount || 0,
          presentPercent: presentPercent || 0,
          absent: absentCount || 0,
          absentPercent: absentPercent || 0,
          late: lateCount || 0,
          latePercent: latePercent || 0,
          leave: leaveCount || 0,
          leavePercent: leavePercent || 0,
          internship: internshipCount || 0,
          internshipPercent: internshipPercent || 0,
          checkInTotal: checkIn.length,
        };
      }),
    );
  }

  async findDailyReportByAdmin(stat: string, end: string) {
    const startDate = new Date(stat);
    const endDate = new Date(end);
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
          },
        },
        department: {
          select: {
            id: true,
            departmentId: true,
            name: true,
          },
        },
      },
    });

    // sort by department.name asc
    const sortedClassrooms = sortClassroomsByNumberAndDepartment(classrooms);

    const students = await this.prisma.student.count();

    const checkIn = await Promise.all(
      sortedClassrooms.map(async (classroom: any) => {
        const reportCheckIn = await this.prisma.reportCheckIn.findFirst({
          where: {
            classroomId: classroom.id,
            checkInDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const checKInBy = await this.prisma.user.findFirst({
          where: {
            teacher: {
              id: reportCheckIn?.createdBy,
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
          },
        });

        // Find student attendance counts
        const presentCount = reportCheckIn ? reportCheckIn.present.length : 0;
        const absentCount = reportCheckIn ? reportCheckIn.absent.length : 0;
        const lateCount = reportCheckIn ? reportCheckIn.late.length : 0;
        const leaveCount = reportCheckIn ? reportCheckIn.leave.length : 0;
        const internshipCount = reportCheckIn
          ? reportCheckIn.internship.length
          : 0;

        // Calculate attendance percentages
        const total =
          presentCount + absentCount + lateCount + leaveCount + internshipCount;
        const presentPercentTotal =
          ccyFormat((presentCount / total) * 100) || 0;
        const absentPercentTotal = ccyFormat((absentCount / total) * 100) || 0;
        const latePercentTotal = ccyFormat((lateCount / total) * 100) || 0;
        const leavePercentTotal = ccyFormat((leaveCount / total) * 100) || 0;
        const internshipPercentTotal =
          ccyFormat((internshipCount / total) * 100) || 0;

        return {
          ...classroom,
          present: presentCount,
          presentPercent: presentPercentTotal,
          absent: absentCount,
          absentPercent: absentPercentTotal,
          late: lateCount,
          latePercent: latePercentTotal,
          leave: leaveCount,
          leavePercent: leavePercentTotal,
          internship: internshipCount,
          internshipPercent: internshipPercentTotal,
          total: total,
          checkInDate: reportCheckIn ? reportCheckIn.checkInDate : null,
          ...(checKInBy ? { checkInBy: checKInBy } : null),
        };
      }),
    );

    return {
      students: students,
      checkIn: checkIn,
    };
  }

  async updateDailyReport(checkInId: string, updateDailyReportDto: any) {
    try {
      // clear data before update
      await this.prisma.reportCheckIn
        .update({
          where: {
            id: checkInId,
          },
          data: {
            present: {
              set: [],
            },
            absent: {
              set: [],
            },
            late: {
              set: [],
            },
            leave: {
              set: [],
            },
            internship: {
              set: [],
            },
            updatedBy: {
              set: updateDailyReportDto.updatedBy,
            },
          },
        })
        .then(async () => {
          return await this.prisma.reportCheckIn.update({
            where: {
              id: checkInId,
            },
            data: {
              present: {
                set: updateDailyReportDto.present,
              },
              absent: {
                set: updateDailyReportDto.absent,
              },
              late: {
                set: updateDailyReportDto.late,
              },
              leave: {
                set: updateDailyReportDto.leave,
              },
              internship: {
                set: updateDailyReportDto.internship,
              },
              updatedBy: {
                set: updateDailyReportDto.updatedBy,
              },
            },
          });
        });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    return await this.prisma.reportCheckIn.delete({
      where: {
        id: id,
      },
    });
  }

  async findStudentDailyReport(
    studentId: string,
    classroomId: string,
    stat: string,
    end: string,
  ) {
    const startDate = new Date(stat);
    const endDate = new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    //  find studentIs in present or absent or late or leave or internship
    const checkIn = await this.prisma.reportCheckIn.findMany({
      where: {
        classroomId: classroomId,
        checkInDate: {
          gte: startDate,
          lte: endDate,
        },
        OR: [
          {
            present: {
              has: studentId,
            },
          },
          {
            absent: {
              has: studentId,
            },
          },
          {
            late: {
              has: studentId,
            },
          },
          {
            leave: {
              has: studentId,
            },
          },
          {
            internship: {
              has: studentId,
            },
          },
        ],
      },
    });
    // Map data for return  Date monday to friday
    const checkIns = await Promise.all(
      checkIn.map(async (checkIn: any) => {
        const present = checkIn.present.includes(studentId);
        const absent = checkIn.absent.includes(studentId);
        const late = checkIn.late.includes(studentId);
        const leave = checkIn.leave.includes(studentId);
        const internship = checkIn.internship.includes(studentId);

        return {
          checkInDate: checkIn.checkInDate,
          has: present
            ? 'Present'
            : absent
            ? 'Absent'
            : late
            ? 'Late'
            : leave
            ? 'Leave'
            : internship
            ? 'Internship'
            : '-',
        };
      }),
    );

    // สร้าง Object weeklyReport ที่เก็บข้อมูลของรายงานสัปดาห์ โดยมี key เป็นชื่อวัน (e.g., 'จันทร์', 'อังคาร') และมี property เก็บวันที่เช็คชื่อและสถานะการเช็คชื่อ
    const weeklyReport: Record<string, { checkInDay: string; has: string }> =
      {};

    // วนลูปตามช่วงวันที่ที่เลือกและเพิ่มข้อมูลเข้าไปใน Object weeklyReport ให้ครบทุกวัน
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      // กำหนดค่า key เป็นชื่อวัน
      const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });

      // หาข้อมูลจาก checkIns ที่มีวันที่ตรงกับวันนี้
      const dayInRow = checkIns.find(
        (checkIn) =>
          new Date(checkIn.checkInDate).toDateString() === date.toDateString(),
      );

      // เพิ่มข้อมูลเข้าไปใน Object weeklyReport โดยตรวจสอบว่ามีข้อมูลวันนี้ใน checkIns หรือไม่ ถ้ามีก็เก็บข้อมูลวันที่เช็คชื่อและสถานะการเช็คชื่อ ถ้าไม่มีก็เก็บข้อมูลวันที่และสถานะเป็น '-'
      weeklyReport[dayOfWeek] = dayInRow
        ? { checkInDay: dayInRow.checkInDate, has: dayInRow.has }
        : { checkInDay: new Date(date.toLocaleDateString()), has: '-' };
    }

    return weeklyReport;
  }
}
