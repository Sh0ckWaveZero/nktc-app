import { AppError } from "@/libs/errors";
import { unscopedPrisma } from "@/libs/prisma";
import { withAcademicYearContext } from "@/libs/academic-year-context";

/** ครอบ Fetch ทั้งสาย async เพื่อคงปีการศึกษาของ request จนจบ */
export const withAcademicYearRequest = async (request: Request, fetch: () => Response | Promise<Response>): Promise<Response> => {
  if (request.method === "OPTIONS" || !request.headers.has("authorization")) return fetch();
  try {
    const state = await unscopedPrisma.academicYearState.findUniqueOrThrow({ where: { id: "current" } });
    const requested = request.headers.get("x-academic-year");
    const versionHeader = request.headers.get("x-academic-year-version");
    const academicYear = requested ? Number(requested) : state.academicYear;
    if (!Number.isInteger(academicYear) || academicYear < 544 || academicYear > 9999)
      throw new AppError("ปีการศึกษาไม่ถูกต้อง", 400, "BAD_REQUEST");
    if (academicYear !== state.academicYear) {
      const year = await unscopedPrisma.academicYear.findUnique({ where: { academicYear } });
      if (!year?.activatedAt) throw new AppError("ไม่พบปีการศึกษาที่เปิดดูได้", 404, "NOT_FOUND");
    }
    return await withAcademicYearContext({
      academicYear, activeAcademicYear: state.academicYear, version: state.version,
      expectedVersion: versionHeader ? Number(versionHeader) : null,
    }, async () => {
      const response = await fetch();
      response.headers.set("X-Academic-Year", String(academicYear));
      response.headers.set("X-Active-Academic-Year", String(state.academicYear));
      response.headers.set("X-Academic-Year-Version", String(state.version));
      return response;
    });
  } catch (error) {
    if (!(error instanceof AppError)) throw error;
    return Response.json({ success: false, statusCode: error.statusCode, message: error.message, errorCode: error.errorCode }, { status: error.statusCode });
  }
};
