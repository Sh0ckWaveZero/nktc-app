import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockTeacherFindMany = mock();
const mockTeacherCount = mock();
const mockAuditLogFindMany = mock();
const mockAuditLogDeleteMany = mock();
const mockAuditLogCreate = mock();

mock.module("@/libs/prisma", () => ({
  prisma: {
    teacher: {
      findMany: mockTeacherFindMany,
      count: mockTeacherCount,
    },
    auditLog: {
      findMany: mockAuditLogFindMany,
      deleteMany: mockAuditLogDeleteMany,
      create: mockAuditLogCreate,
    },
  },
}));

mock.module("@/infrastructure/logging", () => ({
  createLogger: () => ({
    info: () => undefined,
    debug: () => undefined,
    warn: () => undefined,
    error: () => undefined,
  }),
}));

const { TeacherService } = await import("@/modules/teachers/service");

describe("TeacherService.search", () => {
  beforeEach(() => {
    mockTeacherFindMany.mockReset();
    mockTeacherCount.mockReset();
    mockAuditLogFindMany.mockReset();
    mockAuditLogDeleteMany.mockReset();
    mockAuditLogCreate.mockReset();
  });

  it("aggregates login audit logs by teacher username and day", async () => {
    mockTeacherFindMany.mockResolvedValueOnce([
      {
        id: "teacher-1",
        teacherId: "T001",
        status: "active",
        user: {
          username: "alice",
          email: "alice@example.com",
          password: "secret",
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          account: {
            id: "account-1",
            firstName: "Alice",
            lastName: "Teacher",
          },
        },
        classrooms: [],
      },
      {
        id: "teacher-2",
        teacherId: "T002",
        status: "active",
        user: {
          username: "bob",
          email: "bob@example.com",
          password: "secret",
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          account: {
            id: "account-2",
            firstName: "Bob",
            lastName: "Teacher",
          },
        },
        classrooms: [],
      },
    ]);
    mockTeacherCount.mockResolvedValueOnce(2);
    mockAuditLogFindMany.mockResolvedValueOnce([
      {
        createdAt: new Date("2026-05-01T01:00:00.000Z"),
        createdBy: "alice",
      },
      {
        createdAt: new Date("2026-05-01T15:30:00.000Z"),
        createdBy: "alice",
      },
      {
        createdAt: new Date("2026-05-02T03:45:00.000Z"),
        createdBy: "alice",
      },
      {
        createdAt: new Date("2026-05-03T05:15:00.000Z"),
        createdBy: "bob",
      },
      {
        createdAt: new Date("2026-05-03T06:15:00.000Z"),
        createdBy: null,
      },
    ]);

    const result = await TeacherService.search({ q: "", take: 20 });

    expect(mockTeacherFindMany).toHaveBeenCalledWith({
      where: undefined,
      skip: 0,
      take: 20,
      orderBy: {
        user: {
          username: "asc",
        },
      },
      include: expect.anything(),
    });

    expect(mockAuditLogFindMany).toHaveBeenCalledWith({
      where: {
        createdBy: {
          in: ["alice", "bob"],
        },
        action: {
          equals: "Login",
          mode: "insensitive",
        },
      },
      select: {
        createdAt: true,
        createdBy: true,
      },
    });

    expect(result.total).toBe(2);
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        id: "teacher-1",
        loginCountByUser: [
          { date: "2026-05-01", count: 2 },
          { date: "2026-05-02", count: 1 },
        ],
      }),
    );
    expect(result.data[1]).toEqual(
      expect.objectContaining({
        id: "teacher-2",
        loginCountByUser: [{ date: "2026-05-03", count: 1 }],
      }),
    );
    expect(result.data[0].user.password).toBeUndefined();
  });
});

describe("TeacherService.resetAllLoginDays", () => {
  beforeEach(() => {
    mockTeacherFindMany.mockReset();
    mockAuditLogDeleteMany.mockReset();
    mockAuditLogCreate.mockReset();
  });

  it("deletes login audit logs for all teacher usernames and records the reset action", async () => {
    mockTeacherFindMany.mockResolvedValueOnce([
      {
        id: "teacher-1",
        user: {
          username: "alice",
        },
      },
      {
        id: "teacher-2",
        user: {
          username: "bob",
        },
      },
      {
        id: "teacher-3",
        user: {
          username: null,
        },
      },
    ]);
    mockAuditLogDeleteMany.mockResolvedValueOnce({ count: 4 });
    mockAuditLogCreate.mockResolvedValueOnce({ id: "audit-1" });

    const result = await TeacherService.resetAllLoginDays({
      username: "admin",
    });

    expect(mockTeacherFindMany).toHaveBeenCalledWith({
      select: {
        id: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    expect(mockAuditLogDeleteMany).toHaveBeenCalledWith({
      where: {
        createdBy: {
          in: ["alice", "bob"],
        },
        action: {
          equals: "Login",
          mode: "insensitive",
        },
      },
    });
    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: {
        action: "RESET_ALL_TEACHER_LOGIN_DAYS",
        model: "Teacher",
        detail: "Reset login day history for 2 teachers",
        oldValue: "4",
        newValue: "0",
        createdBy: "admin",
      },
    });
    expect(result).toEqual({
      deleted: 4,
      teacherCount: 2,
    });
  });

  it("returns zero when there are no teacher usernames to reset", async () => {
    mockTeacherFindMany.mockResolvedValueOnce([]);
    mockAuditLogCreate.mockResolvedValueOnce({ id: "audit-2" });

    const result = await TeacherService.resetAllLoginDays({ username: "admin" });

    expect(mockAuditLogDeleteMany).not.toHaveBeenCalled();
    expect(result).toEqual({
      deleted: 0,
      teacherCount: 0,
    });
  });
});