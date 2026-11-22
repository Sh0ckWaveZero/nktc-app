import { prisma } from "@/libs/prisma";
import { NotFoundError } from "@/libs/errors";
import { getAcademicYearContext } from "@/libs/academic-year-context";

import type { AttendanceSummaryOptions } from "./options";
import type { AttendanceSummary } from "./types";

import { getAttendanceTermPeriod, summarizeAttendance } from "./summary-utils";

export const AttendanceSummaryService = {
  /** ดึงปีการศึกษาที่ตั้งค่าไว้สำหรับตัวกรอง Dashboard */
  async getOptions(): Promise<AttendanceSummaryOptions> {
    const [years, state] = await Promise.all([
      prisma.academicCalendarYear.findMany({
        where: { year: { activatedAt: { not: null } } },
        orderBy: { academicYear: "desc" },
      }),
      prisma.academicCalendarState.findUnique({
        where: { id: "current" },
        include: { year: true },
      }),
    ]);
    const viewedYear = getAcademicYearContext()?.academicYear ?? state?.academicYear;
    const currentCalendar = years.find((year) => year.academicYear === viewedYear);
    return {
      currentAcademicYear: viewedYear ?? null,
      currentTerm: (currentCalendar?.selectedTerm ?? state?.year.selectedTerm) === 2 ? 2 : 1,
      years: years.map((year) => ({
        academicYear: year.academicYear,
        terms: ([1, 2] as const).map((term) => {
          const { period } = getAttendanceTermPeriod(year, term);
          return {
            term,
            name: period.name,
            startDate: period.startDate,
            endDate: period.endDate,
          };
        }),
      })),
    };
  },
  /** สรุปข้อมูลภาคเรียนจาก Calendar ที่บันทึกจริง โดยไม่รับวันที่ทับจากผู้ใช้ */
  async getSummary(
    academicYear: number,
    term: 1 | 2,
  ): Promise<AttendanceSummary> {
    const settings = await prisma.academicCalendarYear.findUnique({
      where: { academicYear },
    });
    if (!settings)
      throw new NotFoundError("ยังไม่ได้ตั้งค่าปฏิทินของปีการศึกษานี้");
    const now: Date = new Date();
    const { period } = getAttendanceTermPeriod(settings, term, now);
    if (!period.hasStarted)
      return summarizeAttendance(settings, term, [], [], now);
    const [records, classrooms] = await Promise.all([
      prisma.reportCheckIn.findMany({
        where: {
          academicYearId: academicYear,
          checkInDate: {
            gte: new Date(`${period.startDate}T00:00:00.000+07:00`),
            lte: new Date(`${period.throughDate}T23:59:59.999+07:00`),
          },
        },
        select: {
          id: true,
          classroomId: true,
          classroomKey: true,
          checkInDate: true,
          updatedAt: true,
          present: true,
          absent: true,
          late: true,
          leave: true,
          internship: true,
        },
      }),
      prisma.classroom.findMany({
        select: {
          id: true,
          classroomId: true,
          name: true,
          department: { select: { id: true, name: true } },
          level: { select: { levelName: true } },
        },
      }),
    ]);
    return summarizeAttendance(settings, term, records, classrooms, now);
  },
};
