import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { TermStatisticsQueryDto } from './dto/term-statistics.dto';
import { validateAndPrepareDateRange } from '../../utils/date-validation.util';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getTermStatistics(query: TermStatisticsQueryDto) {
    // Validate and prepare date range
    const { startDate, endDate } = validateAndPrepareDateRange(
      query.startDate,
      query.endDate,
    );

    // Build student filter
    const studentFilter: any = {
      studentStatus: {
        not: 'จบการศึกษา',
      },
    };

    if (query.departmentId) {
      studentFilter.classroom = {
        level: {
          program: {
            departmentId: query.departmentId,
          },
        },
      };
    }

    if (query.programId) {
      studentFilter.classroom = {
        ...studentFilter.classroom,
        level: {
          programId: query.programId,
        },
      };
    }

    // Get all students count with filter
    const totalStudents = await this.prisma.student.count({
      where: studentFilter,
    });

    // Build check-in filter
    const checkInFilter: any = {
      checkInDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (query.departmentId || query.programId) {
      checkInFilter.classroom = {
        level: {
          ...(query.programId && { programId: query.programId }),
          ...(query.departmentId && {
            program: {
              departmentId: query.departmentId,
            },
          }),
        },
      };
    }

    // Get all check-in records for the term with filter
    const checkInRecords = await this.prisma.reportCheckIn.findMany({
      where: checkInFilter,
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            user: {
              select: {
                account: {
                  select: {
                    firstName: true,
                    lastName: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate unique students who checked in
    const uniqueStudentIds = new Set<string>();
    checkInRecords.forEach((record) => {
      record.present.forEach((id) => uniqueStudentIds.add(id));
      record.absent.forEach((id) => uniqueStudentIds.add(id));
      record.late.forEach((id) => uniqueStudentIds.add(id));
      record.leave.forEach((id) => uniqueStudentIds.add(id));
      record.internship.forEach((id) => uniqueStudentIds.add(id));
    });

    const studentsCheckedIn = uniqueStudentIds.size;
    const studentsNotCheckedIn = totalStudents - studentsCheckedIn;
    const checkInPercentage =
      totalStudents > 0 ? (studentsCheckedIn / totalStudents) * 100 : 0;
    const notCheckedInPercentage = 100 - checkInPercentage;

    // Calculate total check-in days
    const uniqueDates = new Set(
      checkInRecords.map((record) =>
        new Date(record.checkInDate as Date).toDateString(),
      ),
    );
    const totalCheckInDays = uniqueDates.size;

    // Calculate average attendance rate
    let totalPresentCount = 0;
    let totalStudentCheckIns = 0;

    checkInRecords.forEach((record) => {
      totalPresentCount += record.present.length;
      totalStudentCheckIns +=
        record.present.length +
        record.absent.length +
        record.late.length +
        record.leave.length +
        record.internship.length;
    });

    const averageAttendanceRate =
      totalStudentCheckIns > 0
        ? (totalPresentCount / totalStudentCheckIns) * 100
        : 0;

    // Build teacher filter
    const teacherFilter: any = {};

    if (query.departmentId) {
      teacherFilter.departmentId = query.departmentId;
    }

    if (query.programId) {
      teacherFilter.programId = query.programId;
    }

    // Get all teachers with filter
    const allTeachers = await this.prisma.teacher.findMany({
      where: teacherFilter,
      select: {
        id: true,
        teacherId: true,
        departmentId: true,
        user: {
          select: {
            account: {
              select: {
                firstName: true,
                lastName: true,
                title: true,
              },
            },
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log('📊 Total teachers found:', allTeachers.length);
    console.log('🔍 Teachers without teacherId:', allTeachers.filter(t => !t.teacherId).map(t => ({
      id: t.id,
      teacherId: t.teacherId,
      name: t.user?.account ? `${t.user.account.title}${t.user.account.firstName} ${t.user.account.lastName}` : 'No user',
      departmentId: t.departmentId,
    })));

    // Calculate teacher usage statistics
    const teacherCheckInMap = new Map<
      string,
      { count: number; lastDate: Date | null }
    >();

    checkInRecords.forEach((record) => {
      if (record.teacherId) {
        const existing = teacherCheckInMap.get(record.teacherId) || {
          count: 0,
          lastDate: null,
        };
        existing.count += 1;
        if (
          !existing.lastDate ||
          (record.checkInDate &&
            new Date(record.checkInDate) > existing.lastDate)
        ) {
          existing.lastDate = record.checkInDate as Date;
        }
        teacherCheckInMap.set(record.teacherId, existing);
      }
    });

    const teacherActivityDetails = allTeachers.map((teacher) => {
      const activity = teacherCheckInMap.get(teacher.id) || {
        count: 0,
        lastDate: null,
      };
      const fullName = teacher.user?.account
        ? `${teacher.user.account.title || ''}${
            teacher.user.account.firstName || ''
          } ${teacher.user.account.lastName || ''}`
        : 'ไม่ระบุชื่อ';

      return {
        id: teacher.id,
        teacherId: teacher.teacherId || 'ไม่ระบุรหัส',
        teacherName: fullName.trim(),
        checkInCount: activity.count,
        lastCheckInDate: activity.lastDate,
        isActive: activity.count > 0,
        department: teacher.department?.name,
        program: teacher.program?.name,
      };
    });

    const activeTeachers = teacherActivityDetails.filter(
      (t) => t.isActive,
    ).length;
    const inactiveTeachers = allTeachers.length - activeTeachers;
    const activePercentage =
      allTeachers.length > 0 ? (activeTeachers / allTeachers.length) * 100 : 0;
    const inactivePercentage = 100 - activePercentage;

    // Daily breakdown for DailyBreakdownTable (checkedIn vs notCheckedIn format)
    const dailyBreakdownMap = new Map<
      string,
      {
        date: Date;
        checkedIn: number;
        notCheckedIn: number;
        totalStudents: number;
        attendanceRate: number;
      }
    >();

    // Daily attendance chart data (separate status format)
    const dailyChartMap = new Map<
      string,
      {
        date: Date;
        present: number;
        absent: number;
        late: number;
        leave: number;
        internship: number;
      }
    >();

    checkInRecords.forEach((record) => {
      const dateKey = new Date(record.checkInDate as Date).toDateString();

      // For DailyBreakdownTable format
      const breakdownExisting = dailyBreakdownMap.get(dateKey) || {
        date: record.checkInDate as Date,
        checkedIn: 0,
        notCheckedIn: 0,
        totalStudents: totalStudents,
        attendanceRate: 0,
      };

      const checkedIn = record.present.length + record.late.length;
      const notCheckedIn = record.absent.length + record.leave.length + record.internship.length;

      breakdownExisting.checkedIn += checkedIn;
      breakdownExisting.notCheckedIn += notCheckedIn;

      if (breakdownExisting.checkedIn > 0) {
        breakdownExisting.attendanceRate = (breakdownExisting.checkedIn / totalStudents) * 100;
      }

      dailyBreakdownMap.set(dateKey, breakdownExisting);

      // For DailyAttendanceChart format
      const chartExisting = dailyChartMap.get(dateKey) || {
        date: record.checkInDate as Date,
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        internship: 0,
      };

      chartExisting.present += record.present.length;
      chartExisting.absent += record.absent.length;
      chartExisting.late += record.late.length;
      chartExisting.leave += record.leave.length;
      chartExisting.internship += record.internship.length;

      dailyChartMap.set(dateKey, chartExisting);
    });

    const dailyBreakdown = Array.from(dailyBreakdownMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const dailyChartData = Array.from(dailyChartMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );


    // Classroom statistics
    const classroomMap = new Map<
      string,
      {
        name: string;
        totalStudents: number;
        presentCount: number;
        records: number;
      }
    >();

    checkInRecords.forEach((record) => {
      if (record.classroomId) {
        const existing = classroomMap.get(record.classroomId) || {
          name: record.classroom?.name || 'ไม่ระบุชื่อ',
          totalStudents: 0,
          presentCount: 0,
          records: 0,
        };

        existing.records += 1;
        existing.presentCount += record.present.length;
        // Don't recalculate totalStudents per classroom record
        // Use the overall total students count for accurate representation
        const totalInRecord =
          record.present.length +
          record.absent.length +
          record.late.length +
          record.leave.length +
          record.internship.length;

        // Keep the maximum record count for this classroom, but don't exceed overall total
        if (totalInRecord > existing.totalStudents && totalInRecord <= totalStudents) {
          existing.totalStudents = totalInRecord;
        }

        classroomMap.set(record.classroomId, existing);
      }
    });

    const classroomStats = Array.from(classroomMap.entries()).map(
      ([classroomId, data]) => ({
        classroomId,
        classroomName: data.name,
        totalStudents: data.totalStudents,
        averageAttendance:
          data.records > 0 && data.totalStudents > 0
            ? (data.presentCount / (data.totalStudents * data.records)) * 100
            : 0,
        checkInCount: data.records,
      }),
    );

    return {
      studentCheckInStats: {
        totalStudents,
        studentsCheckedIn,
        checkInPercentage: Math.round(checkInPercentage * 100) / 100,
        studentsNotCheckedIn,
        notCheckedInPercentage: Math.round(notCheckedInPercentage * 100) / 100,
        totalCheckInDays,
        averageAttendanceRate: Math.round(averageAttendanceRate * 100) / 100,
      },
      teacherUsageStats: {
        totalTeachers: allTeachers.length,
        activeTeachers,
        activePercentage: Math.round(activePercentage * 100) / 100,
        inactiveTeachers,
        inactivePercentage: Math.round(inactivePercentage * 100) / 100,
        teacherActivityDetails: teacherActivityDetails.sort(
          (a, b) => b.checkInCount - a.checkInCount,
        ),
      },
      dailyBreakdown,
      dailyChartData,
      classroomStats: classroomStats.sort(
        (a, b) => b.averageAttendance - a.averageAttendance,
      ),
    };
  }

}
