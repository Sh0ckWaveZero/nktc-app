import { getAcademicYearContext } from "@/libs/academic-year-context";
import { AppError, BadRequestError, NotFoundError } from "@/libs/errors";
import { prisma } from "@/libs/prisma";
import { getAttendanceTermPeriod } from "@/modules/attendance-summary/summary-utils";

interface AttendanceResetInput {
  academicYear: number;
  term: 1 | 2;
  activityType?: "CLUB" | "AST" | "SCOUT";
}

export const AttendanceResetService = {
  /** รีเซ็ต Check-in เฉพาะภาคเรียนและประเภทที่เลือก พร้อม Audit log ใน Transaction เดียวกัน */
  async resetTerm(
    input: AttendanceResetInput,
    resetBy: string,
  ): Promise<{ deleted: number }> {
    const context = getAcademicYearContext();
    if (context && input.academicYear !== context.academicYear)
      throw new AppError(
        "ปีการศึกษาเปลี่ยนแล้ว กรุณาโหลดข้อมูลใหม่",
        409,
        "ACADEMIC_YEAR_CHANGED",
      );
    return prisma.$transaction(
      async (transaction): Promise<{ deleted: number }> => {
        const [state] = await transaction.$queryRaw<
          { academicYear: number; version: number }[]
        >`
        SELECT "academicYear", "version" FROM "academic_year_state" WHERE "id" = 'current' FOR SHARE
      `;
        if (!state || input.academicYear !== state.academicYear)
          throw new AppError(
            "ปีการศึกษาเดิมเปิดดูได้อย่างเดียว กรุณากลับปีที่ใช้งานก่อนรีเซ็ต",
            409,
            "ACADEMIC_YEAR_READ_ONLY",
          );
        if (
          context &&
          (state.version !== context.version ||
            (state.version > 1 && context.expectedVersion !== state.version))
        )
          throw new AppError(
            "ปีการศึกษาที่ใช้งานเปลี่ยนแล้ว กรุณาโหลดข้อมูลใหม่",
            409,
            "ACADEMIC_YEAR_CHANGED",
          );
        const settings = await transaction.academicCalendarYear.findUnique({
          where: { academicYear: input.academicYear },
        });
        if (!settings)
          throw new NotFoundError("ยังไม่ได้ตั้งค่าปฏิทินของปีการศึกษานี้");
        const { period } = getAttendanceTermPeriod(settings, input.term);
        if (period.endDate < period.startDate)
          throw new BadRequestError("ช่วงวันที่ของภาคเรียนไม่ถูกต้อง");
        const where = {
          academicYearId: input.academicYear,
          checkInDate: {
            gte: new Date(`${period.startDate}T00:00:00.000+07:00`),
            lte: new Date(`${period.endDate}T23:59:59.999+07:00`),
          },
        };
        const result: { count: number } = input.activityType
          ? await transaction.activityCheckInReport.deleteMany({
              where: { ...where, activityType: input.activityType },
            })
          : await transaction.reportCheckIn.deleteMany({ where });
        await transaction.auditLog.create({
          data: {
            action: input.activityType
              ? "RESET_TERM_ACTIVITY_CHECK_IN"
              : "RESET_TERM_CHECK_IN",
            model: input.activityType
              ? "ActivityCheckInReport"
              : "ReportCheckIn",
            detail: JSON.stringify({
              ...input,
              startDate: period.startDate,
              endDate: period.endDate,
              deleted: result.count,
            }),
            oldValue: String(result.count),
            newValue: "0",
            createdBy: resetBy,
          },
        });
        return { deleted: result.count };
      },
    );
  },
};
