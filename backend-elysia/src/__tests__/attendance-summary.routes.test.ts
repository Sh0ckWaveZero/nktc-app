import { beforeEach, describe, expect, it, mock } from "bun:test";

import type { AttendanceSummaryOptions } from "../modules/attendance-summary/options";
import type { AttendanceSummary } from "../modules/attendance-summary/types";

process.env.JWT_SECRET = "test-attendance-summary-secret-minimum-32";

const settings = {
  academicYear: 2569,
  selectedTerm: 2,
  term1Start: new Date("2026-05-13T00:00:00Z"),
  term2Start: new Date("2026-10-28T00:00:00Z"),
  term1Name: "First term",
  term2Name: "Second term",
  startWeekOnMonday: true,
};
const records = [
  {
    id: "record-1",
    classroomId: "room-1",
    classroomKey: null,
    checkInDate: new Date("2026-05-14T00:00:00Z"),
    updatedAt: new Date("2026-05-14T07:00:00Z"),
    present: ["student-1"],
    absent: [],
    late: [],
    leave: [],
    internship: [],
  },
];
const database = {
  user: {
    findUnique: mock(async ({ where }: { where: { id: string } }) => ({
      id: where.id,
      username: where.id,
      role: where.id.includes("teacher") ? "Teacher" : "Admin",
      status: "active",
    })),
  },
  academicCalendarYear: {
    findMany: mock(async () => [settings]),
    findUnique: mock(async ({ where }: { where: { academicYear: number } }) =>
      where.academicYear === 2569 ? settings : null,
    ),
  },
  academicCalendarState: {
    findUnique: mock(async () => ({ academicYear: 2569, year: settings })),
  },
  reportCheckIn: { findMany: mock(async (_args: unknown) => records) },
  classroom: {
    findMany: mock(async () => [
      {
        id: "room-1",
        classroomId: null,
        name: "Room 1",
        department: { id: "department-1", name: "Department 1" },
        level: { levelName: "Certificate" },
      },
    ]),
  },
};
mock.module("@/libs/prisma", () => ({ prisma: database }));
const { Elysia } = await import("elysia");
const { jwt } = await import("@elysiajs/jwt");
const { errorHandler } = await import("@/plugins/error-handler");
const { attendanceSummary } = await import("@/modules/attendance-summary");
const app = new Elysia()
  .use(errorHandler)
  .use(attendanceSummary)
  .get("/outside-summary", () => ({ ok: true }));
const signToken = async (sub: string): Promise<string> => {
  const response = await new Elysia()
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .get("/sign", ({ jwt: signer }) => signer.sign({ sub }))
    .handle(new Request("http://localhost/sign"));
  return response.text();
};
const admin: string = await signToken("admin-attendance-summary");
const teacher: string = await signToken("teacher-attendance-summary");
const request = (path: string, token: string = admin): Promise<Response> =>
  Promise.resolve(
    app.handle(
      new Request(`http://localhost/attendance-summary${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ),
  );

describe("academic attendance summary API", () => {
  beforeEach(() => {
    database.reportCheckIn.findMany.mockClear();
  });
  it("requires authentication and the Admin role", async () => {
    expect(
      (
        await app.handle(
          new Request("http://localhost/attendance-summary/options"),
        )
      ).status,
    ).toBe(401);
    expect((await request("/options", teacher)).status).toBe(403);
    expect(
      (await request("/term?academicYear=2569&term=1", teacher)).status,
    ).toBe(403);
    expect(database.reportCheckIn.findMany).not.toHaveBeenCalled();
  });
  it("keeps the Admin restriction scoped to the summary routes", async () => {
    const response = await app.handle(
      new Request("http://localhost/outside-summary", {
        headers: { Authorization: `Bearer ${teacher}` },
      }),
    );
    expect(response.status).toBe(200);
  });
  it("lists configured academic years, names and calculated boundaries", async () => {
    const response = await request("/options");
    expect(response.status).toBe(200);
    const result: AttendanceSummaryOptions =
      (await response.json()) as AttendanceSummaryOptions;
    expect(result.currentAcademicYear).toBe(2569);
    expect(result.currentTerm).toBe(2);
    expect(result.years[0].terms[0]).toEqual({
      term: 1,
      name: "First term",
      startDate: "2026-05-13",
      endDate: "2026-09-13",
    });
  });
  it("uses configured term dates and returns aggregate data without student identifiers", async () => {
    const response = await request("/term?academicYear=2569&term=1");
    expect(response.status).toBe(200);
    const result: AttendanceSummary =
      (await response.json()) as AttendanceSummary;
    expect(result.totals.total).toBe(1);
    expect(result.totals.punctualityRate).toBe(100);
    expect(result.period.startDate).toBe("2026-05-13");
    expect(result.period.endDate).toBe("2026-09-13");
    expect(JSON.stringify(result)).not.toContain("student-1");
    expect(database.reportCheckIn.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          academicYearId: 2569,
          checkInDate: {
            gte: new Date("2026-05-12T17:00:00.000Z"),
            lte: new Date("2026-09-13T16:59:59.999Z"),
          },
        },
      }),
    );
  });
  it("rejects invalid semesters, missing years and fractional years", async () => {
    for (const query of [
      "academicYear=2569&term=3",
      "term=1",
      "academicYear=2569.5&term=1",
    ])
      expect((await request(`/term?${query}`)).status).toBe(422);
  });
  it("returns a configuration error for an academic year without a calendar", async () => {
    expect((await request("/term?academicYear=2568&term=1")).status).toBe(404);
  });
  it("does not load attendance records for a future academic term", async () => {
    database.academicCalendarYear.findUnique.mockResolvedValueOnce({
      ...settings,
      academicYear: 2642,
      term1Start: new Date("2099-05-18T00:00:00Z"),
      term2Start: new Date("2099-10-26T00:00:00Z"),
    });
    const response = await request("/term?academicYear=2642&term=1");
    const result: AttendanceSummary =
      (await response.json()) as AttendanceSummary;
    expect(response.status).toBe(200);
    expect(result.period.hasStarted).toBe(false);
    expect(result.totals.punctualityRate).toBeNull();
    expect(database.reportCheckIn.findMany).not.toHaveBeenCalled();
  });
});
