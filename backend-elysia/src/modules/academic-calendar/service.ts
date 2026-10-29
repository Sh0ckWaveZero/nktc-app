import { prisma } from "@/libs/prisma";
import { AppError, BadRequestError } from "@/libs/errors";
import { getAcademicYearContext } from "@/libs/academic-year-context";
import type {
  AcademicCalendarEvent,
  AcademicCalendarYear,
  Prisma,
} from "../../../generated/client";
import type {
  CalendarEventInput,
  CalendarEventQuery,
  CalendarSettingsInput,
} from "./model";

const CURRENT_STATE_ID = "current";

const parseDate = (value: string, field: string): Date => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (
    value.startsWith("0000-") ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new BadRequestError("วันที่ไม่ถูกต้อง", field);
  }
  return parsed;
};

const requireText = (value: string, field: string): string => {
  const trimmed = value.trim();
  if (!trimmed) throw new BadRequestError("กรุณากรอกข้อมูล", field);
  return trimmed;
};

const serializeSettings = (year: AcademicCalendarYear) => ({
  academicYear: year.academicYear,
  selectedTerm: year.selectedTerm,
  term1Start: year.term1Start.toISOString().slice(0, 10),
  term2Start: year.term2Start.toISOString().slice(0, 10),
  term1Name: year.term1Name,
  term2Name: year.term2Name,
  startWeekOnMonday: year.startWeekOnMonday,
});

const serializeEvent = (event: AcademicCalendarEvent) => ({
  id: event.id,
  title: event.title,
  category: event.category,
  startDate: event.startDate.toISOString().slice(0, 10),
  endDate: event.endDate.toISOString().slice(0, 10),
  description: event.description,
});

const eventData = (input: CalendarEventInput) => {
  const startDate = parseDate(input.startDate, "startDate");
  const endDate = parseDate(input.endDate, "endDate");
  if (endDate < startDate) {
    throw new BadRequestError("วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น", "endDate");
  }
  return {
    title: requireText(input.title, "title"),
    category: input.category,
    startDate,
    endDate,
    description: input.description?.trim() || null,
  };
};

export const AcademicCalendarService = {
  async getSettings() {
    const context = getAcademicYearContext();
    if (context) return this.getSettingsForYear(context.academicYear);
    const state = await prisma.academicCalendarState.findUnique({
      where: { id: CURRENT_STATE_ID },
      include: { year: true },
    });
    return state ? serializeSettings(state.year) : null;
  },

  async getSettingsForYear(academicYear: number) {
    const year = await prisma.academicCalendarYear.findUnique({
      where: { academicYear },
    });
    return year ? serializeSettings(year) : null;
  },

  async saveSettings(input: CalendarSettingsInput, userId: string) {
    const context = getAcademicYearContext();
    if (context && (context.academicYear !== context.activeAcademicYear || input.academicYear < context.activeAcademicYear))
      throw new AppError("ปฏิทินปีเดิมเปิดดูได้อย่างเดียว กรุณากลับปีที่ใช้งานก่อนแก้ไข", 409, "ACADEMIC_YEAR_READ_ONLY");
    if (context && context.version > 1 && context.expectedVersion !== context.version)
      throw new AppError("ปีที่ใช้งานเปลี่ยนแล้ว กรุณาโหลดข้อมูลใหม่", 409, "ACADEMIC_YEAR_CHANGED");
    const term1Start = parseDate(input.term1Start, "term1Start");
    const term2Start = parseDate(input.term2Start, "term2Start");
    if (term2Start <= term1Start) {
      throw new BadRequestError("วันเปิดเทอม 2 ต้องหลังวันเปิดเทอม 1", "term2Start");
    }

    const data = {
      selectedTerm: input.selectedTerm,
      term1Start,
      term2Start,
      term1Name: requireText(input.term1Name, "term1Name"),
      term2Name: requireText(input.term2Name, "term2Name"),
      startWeekOnMonday: input.startWeekOnMonday,
      updatedBy: userId,
    };

    const year = await prisma.$transaction(async (transaction) => {
      if (context) {
        const [state] = await transaction.$queryRaw<{ academicYear: number; version: number }[]>`
          SELECT "academicYear", "version" FROM "academic_year_state" WHERE "id" = 'current' FOR SHARE
        `;
        if (!state || state.version !== context.version)
          throw new AppError("ปีที่ใช้งานเปลี่ยนแล้ว กรุณาโหลดข้อมูลใหม่", 409, "ACADEMIC_YEAR_CHANGED");
        if (input.academicYear < state.academicYear)
          throw new AppError("ปฏิทินปีเดิมเปิดดูได้อย่างเดียว", 409, "ACADEMIC_YEAR_READ_ONLY");
      }
      await transaction.academicYear.upsert({
        where: { academicYear: input.academicYear },
        create: { academicYear: input.academicYear, createdBy: userId },
        update: {},
      });
      const saved = await transaction.academicCalendarYear.upsert({
        where: { academicYear: input.academicYear },
        create: { academicYear: input.academicYear, ...data, createdBy: userId },
        update: data,
      });
      return saved;
    });
    return serializeSettings(year);
  },

  async getEvents(query: CalendarEventQuery) {
    const from = query.from ? parseDate(query.from, "from") : undefined;
    const to = query.to ? parseDate(query.to, "to") : undefined;
    const startsFrom = query.startsFrom ? parseDate(query.startsFrom, "startsFrom") : undefined;
    if (from && to && from > to) {
      throw new BadRequestError("วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น", "to");
    }
    if (startsFrom && to && startsFrom > to) {
      throw new BadRequestError("วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น", "to");
    }

    const where: Prisma.AcademicCalendarEventWhereInput = {
      ...(from ? { endDate: { gte: from } } : {}),
      ...(to || startsFrom ? {
        startDate: {
          ...(startsFrom ? { gte: startsFrom } : {}),
          ...(to ? { lte: to } : {}),
        },
      } : {}),
    };
    const events = await prisma.academicCalendarEvent.findMany({
      where,
      orderBy: [{ startDate: "asc" }, { title: "asc" }, { id: "asc" }],
      ...(query.limit ? { take: query.limit } : {}),
    });
    return events.map(serializeEvent);
  },

  async createEvent(input: CalendarEventInput, userId: string) {
    const event = await prisma.academicCalendarEvent.create({
      data: { ...eventData(input), createdBy: userId, updatedBy: userId },
    });
    return serializeEvent(event);
  },

  async updateEvent(id: string, input: CalendarEventInput, userId: string) {
    const event = await prisma.academicCalendarEvent.update({
      where: { id },
      data: { ...eventData(input), updatedBy: userId },
    });
    return serializeEvent(event);
  },

  async deleteEvent(id: string) {
    await prisma.academicCalendarEvent.delete({ where: { id } });
    return { success: true, message: "ลบกิจกรรมเรียบร้อยแล้ว" };
  },
};
