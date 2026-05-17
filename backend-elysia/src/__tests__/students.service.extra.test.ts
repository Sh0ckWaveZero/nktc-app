import { describe, it, expect, mock, beforeEach } from "bun:test";

// --- Prisma mock ---
const mockStudentFindMany = mock();
const mockStudentCount = mock();
const mockStudentFindUnique = mock();
const mockUserFindMany = mock();
const mockUserFindFirst = mock();
const mockGoodnessAggregate = mock();
const mockBadnessAggregate = mock();
const mockTeacherOnClassroomFindMany = mock();
const mockTeacherFindMany = mock();
const mockClassroomFindUnique = mock();
const mockStudentUpdateMany = mock();
const mockAuditLogCreate = mock();
const mockGoodnesDeleteMany = mock(() => Promise.resolve({ count: 0 }));
const mockBadnessDeleteMany = mock(() => Promise.resolve({ count: 0 }));
const mockVisitDeleteMany = mock(() => Promise.resolve({ count: 0 }));
const mockUserDelete = mock(() => Promise.resolve({}));
const mockStudentDelete = mock(() => Promise.resolve({}));
const mockTxStudentFindUnique = mock();
const mockTxStudentUpdate = mock(() => Promise.resolve({}));
const mockTxStudentCreate = mock();
const mockTxAccountUpdate = mock(() => Promise.resolve({}));
const mockTxAccountCreate = mock(() => Promise.resolve({}));
const mockTxUserCreate = mock(() => Promise.resolve({ id: "new-user-id" }));
const mockTxClassroomFindUnique = mock();

const mockTx = {
  goodnessIndividual: { deleteMany: mockGoodnesDeleteMany },
  badnessIndividual: { deleteMany: mockBadnessDeleteMany },
  visitStudent: { deleteMany: mockVisitDeleteMany },
  user: { delete: mockUserDelete, create: mockTxUserCreate },
  student: { delete: mockStudentDelete, findUnique: mockTxStudentFindUnique, update: mockTxStudentUpdate, create: mockTxStudentCreate },
  account: { update: mockTxAccountUpdate, create: mockTxAccountCreate },
  classroom: { findUnique: mockTxClassroomFindUnique },
};

const mockTransaction = mock(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx));

mock.module("@/libs/prisma", () => ({
  prisma: {
    student: {
      findMany: mockStudentFindMany,
      count: mockStudentCount,
      findUnique: mockStudentFindUnique,
      updateMany: mockStudentUpdateMany,
    },
    user: { findMany: mockUserFindMany, findFirst: mockUserFindFirst },
    goodnessIndividual: { aggregate: mockGoodnessAggregate },
    badnessIndividual: { aggregate: mockBadnessAggregate },
    teacherOnClassroom: { findMany: mockTeacherOnClassroomFindMany },
    teacher: { findMany: mockTeacherFindMany },
    classroom: { findUnique: mockClassroomFindUnique },
    auditLog: { create: mockAuditLogCreate },
    $transaction: mockTransaction,
  },
}));

const mockImportStudentsFromXLSX = mock(() => Promise.resolve({ imported: 0, errors: [] }));
const mockGenerateStudentTemplate = mock(() => Buffer.from("template"));

mock.module("@/libs/xlsx", () => ({
  importStudentsFromXLSX: mockImportStudentsFromXLSX,
  generateStudentTemplate: mockGenerateStudentTemplate,
}));

mock.module("bcryptjs", () => ({
  default: { hash: mock(() => Promise.resolve("hashed-pw")) },
  hash: mock(() => Promise.resolve("hashed-pw")),
}));

mock.module("@/infrastructure/logging", () => ({
  logger: { info: mock(), warn: mock(), error: mock(), debug: mock() },
  createLogger: () => ({ info: mock(), warn: mock(), error: mock(), debug: mock() }),
}));

const { StudentService } = await import("@/modules/students/service");
const { NotFoundError } = await import("@/libs/errors");

const STUDENT_WITH_ID_CARD = {
  id: "s1",
  userId: "u1",
  user: { account: { idCard: "1234567890123" } },
};
const STUDENT_SHORT_ID_CARD = {
  id: "s2",
  userId: "u2",
  user: { account: { idCard: "123" } },
};
const STUDENT_NULL_ACCOUNT = { id: "s3", userId: "u3", user: { account: null } };
const STUDENT_NULL_USER = { id: "s4", userId: null, user: null };

function resetAll() {
  for (const m of [
    mockStudentFindMany, mockStudentCount, mockStudentFindUnique, mockUserFindMany, mockUserFindFirst,
    mockGoodnessAggregate, mockBadnessAggregate, mockTeacherOnClassroomFindMany,
    mockTeacherFindMany, mockClassroomFindUnique, mockStudentUpdateMany, mockAuditLogCreate,
    mockGoodnesDeleteMany, mockBadnessDeleteMany, mockVisitDeleteMany,
    mockUserDelete, mockStudentDelete,
    mockTxStudentFindUnique, mockTxStudentUpdate, mockTxStudentCreate,
    mockTxAccountUpdate, mockTxAccountCreate, mockTxUserCreate, mockTxClassroomFindUnique,
    mockTransaction,
  ]) m.mockReset();

  mockTransaction.mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx));
  mockUserFindMany.mockResolvedValue([]);
  mockGoodnesDeleteMany.mockResolvedValue({ count: 0 });
  mockBadnessDeleteMany.mockResolvedValue({ count: 0 });
  mockVisitDeleteMany.mockResolvedValue({ count: 0 });
  mockUserDelete.mockResolvedValue({});
  mockStudentDelete.mockResolvedValue({});
  mockAuditLogCreate.mockResolvedValue({});
  mockTxAccountUpdate.mockResolvedValue({});
  mockTxAccountCreate.mockResolvedValue({});
  mockTxUserCreate.mockResolvedValue({ id: "new-user-id" });
  mockTxStudentUpdate.mockResolvedValue({});
}

describe("StudentService.getList", () => {
  beforeEach(resetAll);

  it("returns data, total, skip, take", async () => {
    mockStudentFindMany.mockResolvedValueOnce([STUDENT_NULL_USER]);
    mockStudentCount.mockResolvedValueOnce(1);

    const result = await StudentService.getList(0, 20);

    expect(result.total).toBe(1);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(20);
    expect(result.data).toHaveLength(1);
  });

  it("masks 13-digit idCard", async () => {
    mockStudentFindMany.mockResolvedValueOnce([STUDENT_WITH_ID_CARD]);
    mockStudentCount.mockResolvedValueOnce(1);

    const result = await StudentService.getList();
    const student = result.data[0] as any;
    expect(student.user.account.idCard).toMatch(/^x-xxxx-xxxxx-x-\d{2}$/);
  });

  it("returns non-13-digit idCard unchanged", async () => {
    mockStudentFindMany.mockResolvedValueOnce([STUDENT_SHORT_ID_CARD]);
    mockStudentCount.mockResolvedValueOnce(1);

    const result = await StudentService.getList();
    const student = result.data[0] as any;
    expect(student.user.account.idCard).toBe("123");
  });

  it("handles student with null account", async () => {
    mockStudentFindMany.mockResolvedValueOnce([STUDENT_NULL_ACCOUNT]);
    mockStudentCount.mockResolvedValueOnce(1);

    const result = await StudentService.getList();
    const student = result.data[0] as any;
    expect(student.user.account).toBeNull();
  });

  it("handles student with null user", async () => {
    mockStudentFindMany.mockResolvedValueOnce([STUDENT_NULL_USER]);
    mockStudentCount.mockResolvedValueOnce(1);

    const result = await StudentService.getList();
    const student = result.data[0] as any;
    expect(student.user).toBeNull();
  });
});

describe("StudentService.search", () => {
  beforeEach(resetAll);

  it("returns masked students without filter", async () => {
    mockStudentFindMany.mockResolvedValueOnce([STUDENT_WITH_ID_CARD]);

    const result = await StudentService.search({} as any);
    expect(result).toHaveLength(1);
  });

  it("calls findMany with classroomId when provided", async () => {
    mockStudentFindMany.mockResolvedValueOnce([]);

    await StudentService.search({ classroomId: "c1" } as any);
    expect(mockStudentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ classroomId: "c1" }) }),
    );
  });

  it("calls findMany with OR search when q provided", async () => {
    mockStudentFindMany.mockResolvedValueOnce([]);

    await StudentService.search({ q: "test" } as any);
    const callArg = mockStudentFindMany.mock.calls[0][0] as any;
    expect(callArg.where.OR).toBeDefined();
  });
});

describe("StudentService.searchWithParams", () => {
  beforeEach(resetAll);

  it("returns paginated results", async () => {
    mockStudentFindMany.mockResolvedValueOnce([STUDENT_NULL_USER]);
    mockStudentCount.mockResolvedValueOnce(5);

    const result = await StudentService.searchWithParams({ skip: 0, take: 10 } as any);
    expect(result.total).toBe(5);
    expect(result.data).toHaveLength(1);
  });

  it("applies studentStatus filter for 'จบการศึกษา'", async () => {
    mockStudentFindMany.mockResolvedValueOnce([]);
    mockStudentCount.mockResolvedValueOnce(0);

    await StudentService.searchWithParams({ studentStatus: "จบการศึกษา" } as any);
    const callArg = mockStudentFindMany.mock.calls[0][0] as any;
    expect(callArg.where.OR).toBeDefined();
  });

  it("applies non-graduated studentStatus filter", async () => {
    mockStudentFindMany.mockResolvedValueOnce([]);
    mockStudentCount.mockResolvedValueOnce(0);

    await StudentService.searchWithParams({ studentStatus: "active" } as any);
    const callArg = mockStudentFindMany.mock.calls[0][0] as any;
    expect(callArg.where.studentStatus).toBe("active");
  });

  it("handles multi-word search query", async () => {
    mockStudentFindMany.mockResolvedValueOnce([]);
    mockStudentCount.mockResolvedValueOnce(0);

    await StudentService.searchWithParams({ q: "John Doe" } as any);
    const callArg = mockStudentFindMany.mock.calls[0][0] as any;
    expect(callArg.where.OR).toBeDefined();
  });

  it("handles single-word search query", async () => {
    mockStudentFindMany.mockResolvedValueOnce([]);
    mockStudentCount.mockResolvedValueOnce(0);

    await StudentService.searchWithParams({ q: "John" } as any);
    const callArg = mockStudentFindMany.mock.calls[0][0] as any;
    expect(callArg.where.OR).toBeDefined();
  });

  it("uses search.studentId when q not set", async () => {
    mockStudentFindMany.mockResolvedValueOnce([]);
    mockStudentCount.mockResolvedValueOnce(0);

    await StudentService.searchWithParams({ search: { studentId: "65001" } } as any);
    const callArg = mockStudentFindMany.mock.calls[0][0] as any;
    expect(callArg.where.OR).toBeDefined();
  });
});

describe("StudentService.getById", () => {
  beforeEach(resetAll);

  it("returns masked student on success", async () => {
    mockStudentFindUnique.mockResolvedValueOnce(STUDENT_WITH_ID_CARD);

    const result = await StudentService.getById("s1") as any;
    expect(result.id).toBe("s1");
    expect(result.user.account.idCard).toMatch(/^x-xxxx-xxxxx-x-\d{2}$/);
  });

  it("throws NotFoundError when student does not exist", async () => {
    mockStudentFindUnique.mockResolvedValueOnce(null);

    await expect(StudentService.getById("nonexistent")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("StudentService.delete", () => {
  beforeEach(resetAll);

  it("throws NotFoundError when student does not exist", async () => {
    mockStudentFindUnique.mockResolvedValueOnce(null);

    await expect(StudentService.delete("bad-id")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("deletes user when student has userId", async () => {
    mockStudentFindUnique.mockResolvedValueOnce({ userId: "u1" });

    await StudentService.delete("s1");

    expect(mockUserDelete).toHaveBeenCalledWith({ where: { id: "u1" } });
    expect(mockStudentDelete).not.toHaveBeenCalled();
  });

  it("deletes student directly when no userId", async () => {
    mockStudentFindUnique.mockResolvedValueOnce({ userId: null });

    await StudentService.delete("s1");

    expect(mockStudentDelete).toHaveBeenCalledWith({ where: { id: "s1" } });
    expect(mockUserDelete).not.toHaveBeenCalled();
  });
});

describe("StudentService.getTrophyOverview", () => {
  beforeEach(resetAll);

  it("returns aggregated scores", async () => {
    mockGoodnessAggregate.mockResolvedValueOnce({ _sum: { goodnessScore: 10 }, _count: 3 });
    mockBadnessAggregate.mockResolvedValueOnce({ _sum: { badnessScore: 4 }, _count: 2 });

    const result = await StudentService.getTrophyOverview("s1");

    expect(result.goodnessScore).toBe(10);
    expect(result.badnessScore).toBe(4);
    expect(result.netScore).toBe(6);
    expect(result.goodnessCount).toBe(3);
    expect(result.badnessCount).toBe(2);
  });

  it("handles null sums as 0", async () => {
    mockGoodnessAggregate.mockResolvedValueOnce({ _sum: { goodnessScore: null }, _count: 0 });
    mockBadnessAggregate.mockResolvedValueOnce({ _sum: { badnessScore: null }, _count: 0 });

    const result = await StudentService.getTrophyOverview("s1");
    expect(result.goodnessScore).toBe(0);
    expect(result.badnessScore).toBe(0);
    expect(result.netScore).toBe(0);
  });
});

describe("StudentService.promotePreview", () => {
  beforeEach(resetAll);

  it("throws NotFoundError when classroom not found", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce(null);

    await expect(StudentService.promotePreview("bad-id")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns classroom name and student list", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce({ name: "ม.1/1" });
    mockStudentFindMany.mockResolvedValueOnce([
      { id: "s1", studentId: "65001", user: { account: { title: "นาย", firstName: "ทดสอบ", lastName: "สอบ" } } },
    ]);

    const result = await StudentService.promotePreview("c1");
    expect(result.classroomName).toBe("ม.1/1");
    expect(result.total).toBe(1);
    expect(result.students[0].name).toContain("ทดสอบ");
  });

  it("falls back to studentId when no account name", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce({ name: "ม.1/1" });
    mockStudentFindMany.mockResolvedValueOnce([
      { id: "s1", studentId: "65001", user: null },
    ]);

    const result = await StudentService.promotePreview("c1");
    expect(result.students[0].name).toBe("65001");
  });
});

describe("StudentService.promoteClassroom", () => {
  beforeEach(resetAll);

  it("throws NotFoundError when source classroom not found", async () => {
    mockClassroomFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "target", name: "ม.2/1", classroomId: "t1", departmentId: "d1", programId: "p1", levelId: "l1" });

    await expect(StudentService.promoteClassroom("bad-src", "target", "admin")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws NotFoundError when target classroom not found", async () => {
    mockClassroomFindUnique
      .mockResolvedValueOnce({ id: "src", name: "ม.1/1", classroomId: "s1" })
      .mockResolvedValueOnce(null);

    await expect(StudentService.promoteClassroom("src", "bad-target", "admin")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws when source and target are same", async () => {
    mockClassroomFindUnique
      .mockResolvedValueOnce({ id: "same", name: "ม.1/1", classroomId: "s1" })
      .mockResolvedValueOnce({ id: "same", name: "ม.1/1", classroomId: "s1", departmentId: "d1", programId: "p1", levelId: "l1" });

    await expect(StudentService.promoteClassroom("same", "same", "admin")).rejects.toThrow();
  });

  it("promotes students and returns count", async () => {
    mockClassroomFindUnique
      .mockResolvedValueOnce({ id: "src", name: "ม.1/1", classroomId: "s1" })
      .mockResolvedValueOnce({ id: "tgt", name: "ม.2/1", classroomId: "t1", departmentId: "d1", programId: "p1", levelId: "l1" });
    mockStudentUpdateMany.mockResolvedValueOnce({ count: 3 });
    mockAuditLogCreate.mockResolvedValueOnce({});

    const result = await StudentService.promoteClassroom("src", "tgt", "admin-1");
    expect(result.promoted).toBe(3);
    expect(result.sourceClassroom).toBe("ม.1/1");
    expect(result.targetClassroom).toBe("ม.2/1");
  });
});

describe("StudentService.getClassroomTeachers", () => {
  beforeEach(resetAll);

  it("returns teachers for classroom", async () => {
    mockTeacherOnClassroomFindMany.mockResolvedValueOnce([{ teacherId: "t1" }, { teacherId: "t2" }]);
    mockTeacherFindMany.mockResolvedValueOnce([{ id: "t1" }, { id: "t2" }]);

    const result = await StudentService.getClassroomTeachers("c1");
    expect(result).toHaveLength(2);
  });

  it("returns empty array when no teachers assigned", async () => {
    mockTeacherOnClassroomFindMany.mockResolvedValueOnce([]);
    mockTeacherFindMany.mockResolvedValueOnce([]);

    const result = await StudentService.getClassroomTeachers("c1");
    expect(result).toHaveLength(0);
  });
});

const CREATE_DATA = {
  studentId: "65001",
  title: "นาย",
  firstName: "ทดสอบ",
  lastName: "สอบ",
  classroomId: "c1",
} as any;

describe("StudentService.create", () => {
  beforeEach(resetAll);

  it("throws ConflictError when studentId already exists", async () => {
    mockStudentFindUnique.mockResolvedValueOnce({ id: "existing" });

    const { ConflictError: CE } = await import("@/libs/errors");
    await expect(StudentService.create("admin", CREATE_DATA)).rejects.toBeInstanceOf(CE);
  });

  it("throws ConflictError when username already taken", async () => {
    mockStudentFindUnique.mockResolvedValueOnce(null);
    mockUserFindFirst.mockResolvedValueOnce({ id: "existing-user" });

    const { ConflictError: CE } = await import("@/libs/errors");
    await expect(StudentService.create("admin", CREATE_DATA)).rejects.toBeInstanceOf(CE);
  });

  it("creates student when no conflicts", async () => {
    mockStudentFindUnique.mockResolvedValueOnce(null);
    mockUserFindFirst.mockResolvedValueOnce(null);
    mockTxStudentCreate.mockResolvedValueOnce({ id: "s-new", user: { account: { idCard: null } } });

    const result = await StudentService.create("admin", CREATE_DATA) as any;
    expect(result.id).toBe("s-new");
    expect(mockTxUserCreate).toHaveBeenCalled();
    expect(mockTxStudentCreate).toHaveBeenCalled();
  });
});

describe("StudentService.update", () => {
  beforeEach(resetAll);

  it("updates student without account change", async () => {
    mockTxStudentFindUnique.mockResolvedValueOnce({ userId: null, classroomId: "c1" });
    mockStudentFindUnique.mockResolvedValueOnce(STUDENT_WITH_ID_CARD);

    await StudentService.update("s1", { classroomId: "c1" } as any);

    expect(mockTxStudentUpdate).toHaveBeenCalled();
    expect(mockTxAccountUpdate).not.toHaveBeenCalled();
  });

  it("updates account when student has userId and account data provided", async () => {
    mockTxStudentFindUnique.mockResolvedValueOnce({ userId: "u1", classroomId: "c1" });
    mockStudentFindUnique.mockResolvedValueOnce(STUDENT_WITH_ID_CARD);

    await StudentService.update("s1", { account: { firstName: "New" } } as any);

    expect(mockTxAccountUpdate).toHaveBeenCalled();
  });

  it("syncs classroom data when classroomId changes", async () => {
    mockTxStudentFindUnique.mockResolvedValueOnce({ userId: null, classroomId: "old-c" });
    mockTxClassroomFindUnique.mockResolvedValueOnce({ departmentId: "d1", programId: "p1", levelId: "l1" });
    mockStudentFindUnique.mockResolvedValueOnce(STUDENT_NULL_USER);

    await StudentService.update("s1", { classroomId: "new-c" } as any);

    expect(mockTxClassroomFindUnique).toHaveBeenCalled();
    expect(mockTxStudentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ departmentId: "d1" }) }),
    );
  });

  it("returns null when student not found after update", async () => {
    mockTxStudentFindUnique.mockResolvedValueOnce({ userId: null, classroomId: "c1" });
    mockStudentFindUnique.mockResolvedValueOnce(null);

    const result = await StudentService.update("s1", {} as any);
    expect(result).toBeNull();
  });
});

describe("StudentService.generateTemplate", () => {
  it("returns buffer from generateStudentTemplate", () => {
    const result = StudentService.generateTemplate();
    expect(result).toBeInstanceOf(Buffer);
  });
});

describe("StudentService.importFromXLSX", () => {
  it("decodes base64 and calls importStudentsFromXLSX", async () => {
    mockImportStudentsFromXLSX.mockResolvedValueOnce({ imported: 2, errors: [] });
    const b64 = Buffer.from("fake-xlsx").toString("base64");

    const result = await StudentService.importFromXLSX(b64, "admin") as any;
    expect(result.imported).toBe(2);
    expect(mockImportStudentsFromXLSX).toHaveBeenCalled();
  });
});

describe("StudentService.graduateClassroom", () => {
  beforeEach(resetAll);

  it("throws NotFoundError when classroom not found", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce(null);

    await expect(StudentService.graduateClassroom("bad", 2567, "admin")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns graduated count and classroom name", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce({ id: "c1", name: "ม.3/1" });
    mockStudentUpdateMany.mockResolvedValueOnce({ count: 25 });
    mockAuditLogCreate.mockResolvedValueOnce({});

    const result = await StudentService.graduateClassroom("c1", 2567, "admin-1");
    expect(result.graduated).toBe(25);
    expect(result.classroom).toBe("ม.3/1");
    expect(result.graduationYear).toBe(2567);
  });

  it("uses provided graduationDate", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce({ id: "c1", name: "ม.3/1" });
    mockStudentUpdateMany.mockResolvedValueOnce({ count: 5 });
    mockAuditLogCreate.mockResolvedValueOnce({});

    const result = await StudentService.graduateClassroom("c1", 2567, "admin-1", "2024-03-31");
    expect(result.graduated).toBe(5);
  });

  it("defaults graduationDate to now when not provided", async () => {
    mockClassroomFindUnique.mockResolvedValueOnce({ id: "c1", name: "ม.3/1" });
    mockStudentUpdateMany.mockResolvedValueOnce({ count: 0 });
    mockAuditLogCreate.mockResolvedValueOnce({});

    await StudentService.graduateClassroom("c1", 2567, "admin-1");
    expect(mockStudentUpdateMany).toHaveBeenCalled();
  });
});
