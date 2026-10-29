import { AppError, BadRequestError, NotFoundError } from "@/libs/errors";
import { unscopedPrisma } from "@/libs/prisma";
import type { AcademicYear, AcademicCalendarYear } from "../../../generated/client";
import type { CalendarSettingsInput } from "../academic-calendar/model";

const STATE_ID = "current";
type YearWithCalendar = AcademicYear & { calendar: AcademicCalendarYear | null };

const serializeYear = (year: YearWithCalendar, activeAcademicYear: number) => ({
  academicYear: year.academicYear,
  status: year.academicYear === activeAcademicYear ? "active" : year.activatedAt ? "archived" : "draft",
  activatedAt: year.activatedAt?.toISOString() ?? null,
  createdAt: year.createdAt.toISOString(),
  calendar: year.calendar ? {
    academicYear: year.academicYear,
    selectedTerm: year.calendar.selectedTerm,
    term1Start: year.calendar.term1Start.toISOString().slice(0, 10),
    term2Start: year.calendar.term2Start.toISOString().slice(0, 10),
    term1Name: year.calendar.term1Name,
    term2Name: year.calendar.term2Name,
    startWeekOnMonday: year.calendar.startWeekOnMonday,
  } : null,
});

/** ตรวจ Calendar ของปีใหม่ก่อนสร้างหรือเปิดใช้งาน */
export const validateYearCalendar = (input: CalendarSettingsInput): void => {
  for (const value of [input.term1Start, input.term2Start]) {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value)
      throw new BadRequestError("วันที่เปิดภาคเรียนไม่ถูกต้อง");
  }
  const gregorianYear = input.academicYear - 543;
  if (Number(input.term1Start.slice(0, 4)) !== gregorianYear)
    throw new BadRequestError("วันเปิดภาคเรียนที่ 1 ต้องอยู่ในปี พ.ศ. ที่ระบุ", "term1Start");
  if (input.term2Start <= input.term1Start || Number(input.term2Start.slice(0, 4)) > gregorianYear + 1)
    throw new BadRequestError("วันเปิดภาคเรียนที่ 2 ต้องหลังภาคเรียนที่ 1 และไม่เกินปีถัดไป", "term2Start");
  if (!input.term1Name.trim() || !input.term2Name.trim()) throw new BadRequestError("กรุณาระบุชื่อภาคเรียน");
};

export const AcademicYearsService = {
  /** Context ใช้ร่วมกันทุกบทบาท เพื่อเลือกดูบันทึกตามปี */
  async getContext() {
    const [state, years] = await Promise.all([
      unscopedPrisma.academicYearState.findUniqueOrThrow({ where: { id: STATE_ID } }),
      unscopedPrisma.academicYear.findMany({
        where: { activatedAt: { not: null } }, include: { calendar: true }, orderBy: { academicYear: "desc" },
      }),
    ]);
    return { activeAcademicYear: state.academicYear, version: state.version, years: years.map((year) => serializeYear(year, state.academicYear)) };
  },

  /** แสดงจำนวนบันทึกของแต่ละปีในเมนูจัดการของ Admin */
  async getManagement() {
    const [state, years, attendance, activities, visits, goodness, badness, events] = await Promise.all([
      unscopedPrisma.academicYearState.findUniqueOrThrow({ where: { id: STATE_ID } }),
      unscopedPrisma.academicYear.findMany({ include: { calendar: true }, orderBy: { academicYear: "desc" } }),
      unscopedPrisma.reportCheckIn.groupBy({ by: ["academicYearId"], _count: true }),
      unscopedPrisma.activityCheckInReport.groupBy({ by: ["academicYearId"], _count: true }),
      unscopedPrisma.visitStudent.groupBy({ by: ["academicYearId"], _count: true }),
      unscopedPrisma.goodnessIndividual.groupBy({ by: ["academicYearId"], _count: true }),
      unscopedPrisma.badnessIndividual.groupBy({ by: ["academicYearId"], _count: true }),
      unscopedPrisma.academicCalendarEvent.groupBy({ by: ["academicYearId"], _count: true }),
    ]);
    const countFor = (groups: { academicYearId: number; _count: number }[], year: number): number =>
      groups.find((group) => group.academicYearId === year)?._count ?? 0;
    return {
      activeAcademicYear: state.academicYear, version: state.version,
      years: years.map((year) => ({
        ...serializeYear(year, state.academicYear),
        counts: {
          attendance: countFor(attendance, year.academicYear), activities: countFor(activities, year.academicYear),
          visits: countFor(visits, year.academicYear), goodness: countFor(goodness, year.academicYear),
          badness: countFor(badness, year.academicYear), events: countFor(events, year.academicYear),
        },
      })),
    };
  },

  /** สร้าง Draft พร้อมวันเปิดเทอม โดยยังไม่เปลี่ยนปีที่ใช้งาน */
  async create(input: CalendarSettingsInput, userId: string) {
    validateYearCalendar(input);
    const state = await unscopedPrisma.academicYearState.findUniqueOrThrow({ where: { id: STATE_ID } });
    if (input.academicYear <= state.academicYear) throw new BadRequestError("ปีใหม่ต้องมากกว่าปีการศึกษาที่ใช้งาน");
    const year = await unscopedPrisma.academicYear.create({
      data: {
        academicYear: input.academicYear, createdBy: userId,
        calendar: { create: {
          selectedTerm: input.selectedTerm, term1Start: new Date(`${input.term1Start}T00:00:00Z`),
          term2Start: new Date(`${input.term2Start}T00:00:00Z`), term1Name: input.term1Name.trim(),
          term2Name: input.term2Name.trim(), startWeekOnMonday: input.startWeekOnMonday,
          createdBy: userId, updatedBy: userId,
        } },
      }, include: { calendar: true },
    });
    return serializeYear(year, state.academicYear);
  },

  /** เปิดปีใหม่แบบ Atomic โดยเก็บบันทึกเดิมครบและตรวจป้องกันการยืนยันซ้ำ */
  async activate(academicYear: number, expectedVersion: number, userId: string) {
    return unscopedPrisma.$transaction(async (transaction) => {
      const [state] = await transaction.$queryRaw<{ academicYear: number; version: number }[]>`
        SELECT "academicYear", "version" FROM "academic_year_state" WHERE "id" = 'current' FOR UPDATE
      `;
      if (!state || state.version !== expectedVersion)
        throw new AppError("ปีที่ใช้งานเปลี่ยนแล้ว กรุณาตรวจสอบข้อมูลแล้วกดยืนยันใหม่", 409, "ACADEMIC_YEAR_CHANGED");
      const year = await transaction.academicYear.findUnique({ where: { academicYear }, include: { calendar: true } });
      if (!year) throw new NotFoundError("ไม่พบปีการศึกษาที่ต้องการเปิดใช้");
      if (year.activatedAt || academicYear <= state.academicYear)
        throw new BadRequestError("เปิดใช้ได้เฉพาะปีใหม่ที่ยังไม่เคยใช้งาน ปีเดิมเปิดดูย้อนหลังได้");
      if (!year.calendar) throw new BadRequestError("กรุณาตั้งค่าวันเปิดภาคเรียนก่อนเปิดใช้งาน");
      validateYearCalendar({
        ...year.calendar, selectedTerm: year.calendar.selectedTerm === 2 ? 2 : 1,
        term1Start: year.calendar.term1Start.toISOString().slice(0, 10),
        term2Start: year.calendar.term2Start.toISOString().slice(0, 10),
      });
      await transaction.academicYear.update({ where: { academicYear }, data: { activatedAt: new Date(), activatedBy: userId } });
      await transaction.academicYearState.update({
        where: { id: STATE_ID }, data: { academicYear, version: { increment: 1 }, updatedBy: userId },
      });
      await transaction.academicCalendarState.upsert({
        where: { id: STATE_ID }, create: { id: STATE_ID, academicYear, updatedBy: userId }, update: { academicYear, updatedBy: userId },
      });
      await transaction.auditLog.create({ data: {
        action: "ACTIVATE_ACADEMIC_YEAR", model: "AcademicYear", recordId: String(academicYear),
        oldValue: String(state.academicYear), newValue: String(academicYear), createdBy: userId,
        detail: "เปิดปีการศึกษาใหม่ รายชื่อและโครงสร้างร่วมกัน บันทึกประจำปีแยกจากปีเดิม",
      } });
      return { activeAcademicYear: academicYear, version: state.version + 1 };
    });
  },
};
