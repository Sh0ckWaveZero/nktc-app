import { beforeEach, describe, expect, it, mock } from "bun:test";

import { withAcademicYearContext } from "@/libs/academic-year-context";

process.env.JWT_SECRET = "test-attendance-reset-secret-minimum-32";

const settings = {
  academicYear: 2569,
  selectedTerm: 1,
  term1Start: new Date("2026-05-13T00:00:00Z"),
  term2Start: new Date("2026-10-28T00:00:00Z"),
  term1Name: "First term",
  term2Name: "Second term",
  startWeekOnMonday: true,
};
const transaction = {
  $queryRaw: mock(async () => [{ academicYear: 2569, version: 1 }]),
  academicCalendarYear: {
    findUnique: mock(
      async (_args: unknown): Promise<typeof settings | null> => settings,
    ),
  },
  reportCheckIn: { deleteMany: mock(async (_args: unknown) => ({ count: 8 })) },
  activityCheckInReport: {
    deleteMany: mock(async (_args: unknown) => ({ count: 5 })),
  },
  auditLog: { create: mock(async (_args: unknown) => ({ id: "audit-reset" })) },
};
const database = {
  ...transaction,
  user: {
    findUnique: mock(async ({ where }: { where: { id: string } }) => ({
      id: where.id,
      username: where.id,
      role: where.id.includes("teacher") ? "Teacher" : "Admin",
      status: "active",
    })),
  },
  $transaction: mock(
    async (
      callback: (client: typeof transaction) => Promise<{ deleted: number }>,
    ) => callback(transaction),
  ),
};
mock.module("@/libs/prisma", () => ({ prisma: database }));

const { Elysia } = await import("elysia");
const { jwt } = await import("@elysiajs/jwt");
const { errorHandler } = await import("@/plugins/error-handler");
const { reportCheckIn } = await import("@/modules/report-check-in");
const { activityCheckIn } = await import("@/modules/activity-check-in");
const { AttendanceResetService } =
  await import("@/modules/attendance-reset/service");
const app = new Elysia()
  .use(errorHandler)
  .use(reportCheckIn)
  .use(activityCheckIn);
const signToken = async (sub: string): Promise<string> => {
  const response = await new Elysia()
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .get("/sign", ({ jwt: signer }) => signer.sign({ sub }))
    .handle(new Request("http://localhost/sign"));
  return response.text();
};
const admin: string = await signToken("admin-attendance-reset");
const teacher: string = await signToken("teacher-attendance-reset");
const request = (
  endpoint: string,
  body: unknown,
  token: string = admin,
): Promise<Response> =>
  Promise.resolve(
    app.handle(
      new Request(`http://localhost${endpoint}/reset-term`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      }),
    ),
  );
const flagpole: string = "/reportCheckIn";
const activity: string = "/activity-check-in";

describe("semester attendance reset", () => {
  beforeEach(() => {
    transaction.$queryRaw.mockReset();
    transaction.$queryRaw.mockResolvedValue([
      { academicYear: 2569, version: 1 },
    ]);
    transaction.academicCalendarYear.findUnique.mockReset();
    transaction.academicCalendarYear.findUnique.mockResolvedValue(settings);
    transaction.reportCheckIn.deleteMany.mockClear();
    transaction.activityCheckInReport.deleteMany.mockClear();
    transaction.auditLog.create.mockReset();
    transaction.auditLog.create.mockResolvedValue({ id: "audit-reset" });
    database.$transaction.mockClear();
  });

  it("requires authentication and Admin access for both reset endpoints", async () => {
    for (const endpoint of [flagpole, activity]) {
      const body = {
        academicYear: 2569,
        term: 1,
        ...(endpoint === activity ? { activityType: "CLUB" } : {}),
      };
      expect((await request(endpoint, body, "")).status).toBe(401);
      expect((await request(endpoint, body, teacher)).status).toBe(403);
    }
    expect(transaction.reportCheckIn.deleteMany).not.toHaveBeenCalled();
    expect(transaction.activityCheckInReport.deleteMany).not.toHaveBeenCalled();
  });

  it("resets the entire configured term and year and records the deleted count and actor", async () => {
    const response: Response = await request(flagpole, {
      academicYear: 2569,
      term: 1,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deleted: 8 });
    expect(transaction.reportCheckIn.deleteMany).toHaveBeenCalledWith({
      where: {
        academicYearId: 2569,
        checkInDate: {
          gte: new Date("2026-05-12T17:00:00Z"),
          lte: new Date("2026-09-13T16:59:59.999Z"),
        },
      },
    });
    expect(transaction.activityCheckInReport.deleteMany).not.toHaveBeenCalled();
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "RESET_TERM_CHECK_IN",
        model: "ReportCheckIn",
        detail: JSON.stringify({
          academicYear: 2569,
          term: 1,
          startDate: "2026-05-13",
          endDate: "2026-09-13",
          deleted: 8,
        }),
        oldValue: "8",
        newValue: "0",
        createdBy: "admin-attendance-reset",
      },
    });
  });

  it("restricts an activity reset to the chosen type and handles term 2 across years", async () => {
    const response: Response = await request(activity, {
      academicYear: 2569,
      term: 2,
      activityType: "SCOUT",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deleted: 5 });
    expect(transaction.activityCheckInReport.deleteMany).toHaveBeenCalledWith({
      where: {
        academicYearId: 2569,
        activityType: "SCOUT",
        checkInDate: {
          gte: new Date("2026-10-27T17:00:00Z"),
          lte: new Date("2027-02-28T16:59:59.999Z"),
        },
      },
    });
    expect(transaction.reportCheckIn.deleteMany).not.toHaveBeenCalled();
  });

  it("clips the first semester before the opening of semester 2", async () => {
    transaction.academicCalendarYear.findUnique.mockResolvedValueOnce({
      ...settings,
      term2Start: new Date("2026-08-12T00:00:00Z"),
    });
    expect(
      (await request(flagpole, { academicYear: 2569, term: 1 })).status,
    ).toBe(200);
    expect(transaction.reportCheckIn.deleteMany).toHaveBeenCalledWith({
      where: {
        academicYearId: 2569,
        checkInDate: {
          gte: new Date("2026-05-12T17:00:00Z"),
          lte: new Date("2026-08-11T16:59:59.999Z"),
        },
      },
    });
  });

  it("rejects missing, fractional or invalid years, semesters and activity types", async () => {
    for (const body of [
      { term: 1 },
      { academicYear: 2569.5, term: 1 },
      { academicYear: 2569, term: 3 },
    ])
      expect((await request(flagpole, body)).status).toBe(422);
    for (const activityType of [undefined, "", "INVALID"])
      expect(
        (await request(activity, { academicYear: 2569, term: 1, activityType }))
          .status,
      ).toBe(422);
    expect(database.$transaction).not.toHaveBeenCalled();
  });

  it("does not delete records when the calendar is missing", async () => {
    transaction.academicCalendarYear.findUnique.mockResolvedValueOnce(null);
    expect(
      (await request(flagpole, { academicYear: 2569, term: 1 })).status,
    ).toBe(404);
    expect(transaction.reportCheckIn.deleteMany).not.toHaveBeenCalled();
  });

  it("blocks resetting an archived year", async () => {
    expect(
      (await request(flagpole, { academicYear: 2568, term: 1 })).status,
    ).toBe(409);
    expect(transaction.reportCheckIn.deleteMany).not.toHaveBeenCalled();
  });

  it("blocks a payload for a different request year and stale activation versions", async () => {
    const context = {
      academicYear: 2569,
      activeAcademicYear: 2569,
      version: 2,
      expectedVersion: 2,
    };
    await expect(
      withAcademicYearContext(context, () =>
        AttendanceResetService.resetTerm(
          { academicYear: 2568, term: 1 },
          "admin",
        ),
      ),
    ).rejects.toMatchObject({ errorCode: "ACADEMIC_YEAR_CHANGED" });
    transaction.$queryRaw.mockResolvedValueOnce([
      { academicYear: 2569, version: 3 },
    ]);
    await expect(
      withAcademicYearContext(context, () =>
        AttendanceResetService.resetTerm(
          { academicYear: 2569, term: 1 },
          "admin",
        ),
      ),
    ).rejects.toMatchObject({ errorCode: "ACADEMIC_YEAR_CHANGED" });
    expect(transaction.reportCheckIn.deleteMany).not.toHaveBeenCalled();
  });

  it("fails the transaction if the audit entry cannot be saved", async () => {
    transaction.auditLog.create.mockRejectedValueOnce(
      new Error("Audit unavailable"),
    );
    expect(
      (await request(flagpole, { academicYear: 2569, term: 1 })).status,
    ).toBe(500);
    expect(database.$transaction).toHaveBeenCalledTimes(1);
  });
});
