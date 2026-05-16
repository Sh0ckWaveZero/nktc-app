import { describe, it, expect, mock, beforeEach } from "bun:test";

// --- Prisma mock setup ---
const mockClassroomFindUnique = mock();
const mockStudentFindMany = mock();
const mockGoodnesDeleteMany = mock(() => Promise.resolve({ count: 0 }));
const mockBadnessDeleteMany = mock(() => Promise.resolve({ count: 0 }));
const mockVisitDeleteMany = mock(() => Promise.resolve({ count: 0 }));
const mockUserDeleteMany = mock(() => Promise.resolve({ count: 0 }));
const mockStudentDeleteMany = mock(() => Promise.resolve({ count: 0 }));
const mockAuditLogCreate = mock(() => Promise.resolve({}));

const mockTx = {
  student: { findMany: mockStudentFindMany, deleteMany: mockStudentDeleteMany },
  goodnessIndividual: { deleteMany: mockGoodnesDeleteMany },
  badnessIndividual: { deleteMany: mockBadnessDeleteMany },
  visitStudent: { deleteMany: mockVisitDeleteMany },
  user: { deleteMany: mockUserDeleteMany },
  auditLog: { create: mockAuditLogCreate },
};

const mockTransaction = mock(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx));

mock.module("@/libs/prisma", () => ({
  prisma: {
    classroom: { findUnique: mockClassroomFindUnique },
    $transaction: mockTransaction,
  },
}));

const { StudentService } = await import("@/modules/students/service");
const { NotFoundError } = await import("@/libs/errors");

const CLASSROOM = { id: "class-1", name: "ม.1/1" };
const STUDENTS_WITH_USER = [
  { id: "s1", userId: "u1" },
  { id: "s2", userId: "u2" },
];
const STUDENTS_WITHOUT_USER = [
  { id: "s3", userId: null },
  { id: "s4", userId: null },
];

describe("StudentService.deleteAllByClassroom", () => {
  beforeEach(() => {
    mockClassroomFindUnique.mockReset();
    mockStudentFindMany.mockReset();
    mockGoodnesDeleteMany.mockReset();
    mockBadnessDeleteMany.mockReset();
    mockVisitDeleteMany.mockReset();
    mockUserDeleteMany.mockReset();
    mockStudentDeleteMany.mockReset();
    mockAuditLogCreate.mockReset();
    mockTransaction.mockReset();

    // Default: tx runs the callback
    mockTransaction.mockImplementation(
      async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
    );
    mockGoodnesDeleteMany.mockResolvedValue({ count: 0 });
    mockBadnessDeleteMany.mockResolvedValue({ count: 0 });
    mockVisitDeleteMany.mockResolvedValue({ count: 0 });
    mockUserDeleteMany.mockResolvedValue({ count: 0 });
    mockStudentDeleteMany.mockResolvedValue({ count: 0 });
    mockAuditLogCreate.mockResolvedValue({});
  });

  it("throws NotFoundError when classroom does not exist", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce(null);

    await expect(
      StudentService.deleteAllByClassroom("nonexistent", "admin-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns correct classroom name and deleted count", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce(CLASSROOM);
    mockStudentFindMany.mockResolvedValueOnce(STUDENTS_WITH_USER);

    const result = await StudentService.deleteAllByClassroom("class-1", "admin-1");

    expect(result.deleted).toBe(2);
    expect(result.classroom).toBe("ม.1/1");
  });

  it("returns 0 deleted for empty classroom", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce(CLASSROOM);
    mockStudentFindMany.mockResolvedValueOnce([]);

    const result = await StudentService.deleteAllByClassroom("class-1", "admin-1");

    expect(result.deleted).toBe(0);
    expect(mockUserDeleteMany).not.toHaveBeenCalled();
  });

  it("deletes user accounts when students have userId", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce(CLASSROOM);
    mockStudentFindMany.mockResolvedValueOnce(STUDENTS_WITH_USER);

    await StudentService.deleteAllByClassroom("class-1", "admin-1");

    expect(mockUserDeleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["u1", "u2"] } },
    });
  });

  it("skips user deletion when students have no userId", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce(CLASSROOM);
    mockStudentFindMany.mockResolvedValueOnce(STUDENTS_WITHOUT_USER);

    await StudentService.deleteAllByClassroom("class-1", "admin-1");

    expect(mockUserDeleteMany).not.toHaveBeenCalled();
  });

  it("always deletes student records regardless of userId", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce(CLASSROOM);
    mockStudentFindMany.mockResolvedValueOnce(STUDENTS_WITHOUT_USER);

    await StudentService.deleteAllByClassroom("class-1", "admin-1");

    expect(mockStudentDeleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["s3", "s4"] } },
    });
  });

  it("creates audit log with classroomId, studentIds, and userIds", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce(CLASSROOM);
    mockStudentFindMany.mockResolvedValueOnce(STUDENTS_WITH_USER);

    await StudentService.deleteAllByClassroom("class-1", "admin-1");

    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "DELETE_ALL_CLASSROOM_STUDENTS",
        createdBy: "admin-1",
        oldValue: expect.stringContaining('"classroomId":"class-1"'),
      }),
    });

    const callArg = mockAuditLogCreate.mock.calls[0][0] as { data: { oldValue: string } };
    const oldValue = JSON.parse(callArg.data.oldValue);
    expect(oldValue.studentIds).toEqual(["s1", "s2"]);
    expect(oldValue.userIds).toEqual(["u1", "u2"]);
  });

  it("runs findMany INSIDE transaction (TOCTOU fix)", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce(CLASSROOM);
    mockStudentFindMany.mockResolvedValueOnce(STUDENTS_WITH_USER);

    await StudentService.deleteAllByClassroom("class-1", "admin-1");

    // findMany should be called on tx, not on prisma directly
    // mockTransaction callback runs our fn — mockStudentFindMany is on mockTx
    expect(mockTransaction).toHaveBeenCalled();
    expect(mockStudentFindMany).toHaveBeenCalledWith({
      where: { classroomId: "class-1" },
      select: { id: true, userId: true },
    });
  });

  it("deletes related records (goodness, badness, visits) with student IDs", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce(CLASSROOM);
    mockStudentFindMany.mockResolvedValueOnce(STUDENTS_WITH_USER);

    await StudentService.deleteAllByClassroom("class-1", "admin-1");

    const expectedWhere = { where: { studentKey: { in: ["s1", "s2"] } } };
    expect(mockGoodnesDeleteMany).toHaveBeenCalledWith(expectedWhere);
    expect(mockBadnessDeleteMany).toHaveBeenCalledWith(expectedWhere);
    expect(mockVisitDeleteMany).toHaveBeenCalledWith(expectedWhere);
  });
});
