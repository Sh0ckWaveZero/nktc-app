import { describe, it, expect, mock, beforeEach } from "bun:test";

process.env.JWT_SECRET = "test-jwt-secret-minimum-32-chars!!";

// --- Prisma mocks ---
const mockUserFindUnique = mock();
const mockTeacherFindUnique = mock();
const mockProgramFindUnique = mock();
const mockClassroomFindFirst = mock();
const mockClassroomCreate = mock();
const mockTeacherOnClassroomCreate = mock();
const mockTeacherOnClassroomFindUnique = mock();
const mockClassroomFindMany = mock();

mock.module("@/libs/prisma", () => ({
  prisma: {
    user: { findUnique: mockUserFindUnique },
    teacher: { findUnique: mockTeacherFindUnique },
    program: { findUnique: mockProgramFindUnique },
    classroom: {
      findFirst: mockClassroomFindFirst,
      create: mockClassroomCreate,
      findMany: mockClassroomFindMany,
    },
    teacherOnClassroom: {
      create: mockTeacherOnClassroomCreate,
      findUnique: mockTeacherOnClassroomFindUnique,
    },
    department: { findUnique: mock().mockResolvedValue({ id: "dept-1" }) },
    level: { findUnique: mock().mockResolvedValue({ id: "level-1" }) },
  },
}));

mock.module("@/infrastructure/logging", () => ({
  logger: { info: mock(), warn: mock(), error: mock(), debug: mock() },
  createLogger: () => ({ info: mock(), warn: mock(), error: mock(), debug: mock() }),
}));

const { Elysia } = await import("elysia");
const { jwt } = await import("@elysiajs/jwt");
const { authGuard } = await import("@/middleware/auth");
const { errorHandler } = await import("@/plugins/error-handler");
const { classrooms } = await import("@/modules/classrooms");

const testApp = new Elysia().use(errorHandler).use(classrooms);

async function signToken(payload: Record<string, unknown>): Promise<string> {
  const res = await new Elysia()
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .get("/sign", ({ jwt }: { jwt: { sign: (p: unknown) => Promise<string> } }) =>
      jwt.sign(payload),
    )
    .handle(new Request("http://localhost/sign"));
  return res.text();
}

const CLASSROOM_RESPONSE = {
  id: "cls-1",
  classroomId: "CR001",
  name: "ปวช.1/1-ช่างไฟฟ้า",
  departmentId: "dept-1",
  programId: "prog-1",
  levelId: "level-1",
  description: null,
  status: "active",
  teacherIds: [],
  levelClassroomIds: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: "user-teacher-1",
  updatedBy: "user-teacher-1",
  program: null,
  department: null,
  level: null,
  levelClassrooms: [],
  _count: { student: 0, teachers: 0, course: 0, reportCheckIn: 0, activityCheckInReport: 0, levelClassrooms: 0 },
};

describe("POST /classrooms — Admin role", () => {
  beforeEach(() => {
    mockUserFindUnique.mockReset();
    mockClassroomFindFirst.mockReset();
    mockClassroomCreate.mockReset();
  });

  it("creates classroom when Admin", async () => {
    const token = await signToken({ sub: "admin-1" });
    mockUserFindUnique.mockResolvedValue({ id: "admin-1", username: "admin", role: "Admin", status: "active" });
    mockClassroomFindFirst.mockResolvedValue(null);
    mockClassroomCreate.mockResolvedValue(CLASSROOM_RESPONSE);

    const res = await testApp.handle(
      new Request("http://localhost/classrooms", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId: "CR001", name: "ปวช.1/1-ช่างไฟฟ้า", departmentId: "dept-1" }),
      }),
    );
    expect(res.status).toBe(201);
  });

  it("returns 401 when no token", async () => {
    const res = await testApp.handle(
      new Request("http://localhost/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId: "CR001", name: "test" }),
      }),
    );
    expect(res.status).toBe(401);
  });
});

describe("POST /classrooms — Teacher role (scoped creation)", () => {
  beforeEach(() => {
    mockUserFindUnique.mockReset();
    mockTeacherFindUnique.mockReset();
    mockProgramFindUnique.mockReset();
    mockClassroomFindFirst.mockReset();
    mockClassroomCreate.mockReset();
    mockTeacherOnClassroomCreate.mockReset();
  });

  it("creates classroom scoped to teacher department + auto-assigns advisor", async () => {
    const token = await signToken({ sub: "user-teacher-1" });
    mockUserFindUnique.mockResolvedValue({ id: "user-teacher-1", username: "teacher1", role: "Teacher", status: "active" });
    mockTeacherFindUnique.mockResolvedValue({ id: "teacher-1", departmentId: "dept-1" });
    mockClassroomFindFirst.mockResolvedValue(null);
    mockClassroomCreate.mockResolvedValue(CLASSROOM_RESPONSE);
    mockTeacherOnClassroomCreate.mockResolvedValue({});

    const res = await testApp.handle(
      new Request("http://localhost/classrooms", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId: "CR001", name: "ปวช.1/1-ช่างไฟฟ้า" }),
      }),
    );
    expect(res.status).toBe(201);
    expect(mockTeacherOnClassroomCreate).toHaveBeenCalledTimes(1);
    const assignCall = mockTeacherOnClassroomCreate.mock.calls[0][0];
    expect(assignCall.data.teacherId).toBe("teacher-1");
    expect(assignCall.data.classroomId).toBe("cls-1");
  });

  it("ignores departmentId in body — uses teacher's own department", async () => {
    const token = await signToken({ sub: "user-teacher-1" });
    mockUserFindUnique.mockResolvedValue({ id: "user-teacher-1", username: "teacher1", role: "Teacher", status: "active" });
    mockTeacherFindUnique.mockResolvedValue({ id: "teacher-1", departmentId: "dept-1" });
    mockClassroomFindFirst.mockResolvedValue(null);
    mockClassroomCreate.mockResolvedValue(CLASSROOM_RESPONSE);
    mockTeacherOnClassroomCreate.mockResolvedValue({});

    await testApp.handle(
      new Request("http://localhost/classrooms", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId: "CR001", name: "ปวช.1/1-ช่างไฟฟ้า", departmentId: "dept-HACKED" }),
      }),
    );

    const createCall = mockClassroomCreate.mock.calls[0][0];
    expect(createCall.data.departmentId).toBe("dept-1");
  });

  it("returns 403 when teacher has no teacher record", async () => {
    const token = await signToken({ sub: "user-ghost" });
    mockUserFindUnique.mockResolvedValue({ id: "user-ghost", username: "ghost", role: "Teacher", status: "active" });
    mockTeacherFindUnique.mockResolvedValue(null);

    const res = await testApp.handle(
      new Request("http://localhost/classrooms", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId: "CR002", name: "test" }),
      }),
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 when programId not in teacher department", async () => {
    const token = await signToken({ sub: "user-teacher-1" });
    mockUserFindUnique.mockResolvedValue({ id: "user-teacher-1", username: "teacher1", role: "Teacher", status: "active" });
    mockTeacherFindUnique.mockResolvedValue({ id: "teacher-1", departmentId: "dept-1" });
    mockProgramFindUnique.mockResolvedValue({ departmentId: "dept-OTHER" });

    const res = await testApp.handle(
      new Request("http://localhost/classrooms", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId: "CR001", name: "test", programId: "prog-other" }),
      }),
    );
    expect(res.status).toBe(400);
  });
});

describe("PATCH /classrooms/:id — Teacher role (own classroom only)", () => {
  beforeEach(() => {
    mockUserFindUnique.mockReset();
    mockTeacherFindUnique.mockReset();
    mockTeacherOnClassroomFindUnique.mockReset();
  });

  it("returns 403 when teacher tries to update another teacher's classroom", async () => {
    const token = await signToken({ sub: "user-teacher-1" });
    mockUserFindUnique.mockResolvedValue({ id: "user-teacher-1", username: "teacher1", role: "Teacher", status: "active" });
    mockTeacherFindUnique.mockResolvedValue({ id: "teacher-1" });
    mockTeacherOnClassroomFindUnique.mockResolvedValue(null);

    const res = await testApp.handle(
      new Request("http://localhost/classrooms/cls-OTHER", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "hacked name" }),
      }),
    );
    expect(res.status).toBe(403);
  });
});
