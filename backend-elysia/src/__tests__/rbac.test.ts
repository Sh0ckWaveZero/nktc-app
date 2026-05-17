import { describe, it, expect, mock, beforeEach } from "bun:test";

process.env.JWT_SECRET = "test-jwt-secret-minimum-32-chars!!";

const mockFindUnique = mock();

mock.module("@/libs/prisma", () => ({
  prisma: { user: { findUnique: mockFindUnique } },
}));

mock.module("@/infrastructure/logging", () => ({
  logger: { info: mock(), warn: mock(), error: mock(), debug: mock() },
  createLogger: () => ({ info: mock(), warn: mock(), error: mock(), debug: mock() }),
}));

const { Elysia } = await import("elysia");
const { jwt } = await import("@elysiajs/jwt");
const { requireRoles } = await import("@/middleware/rbac");
const { errorHandler } = await import("@/plugins/error-handler");

async function signToken(payload: Record<string, unknown>): Promise<string> {
  const res = await new Elysia()
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .get("/sign", ({ jwt }: { jwt: { sign: (p: unknown) => Promise<string> } }) =>
      jwt.sign(payload),
    )
    .handle(new Request("http://localhost/sign"));
  return res.text();
}

const adminApp = new Elysia()
  .use(errorHandler)
  .use(requireRoles(["Admin"]))
  .get("/admin", () => ({ ok: true }));

const multiRoleApp = new Elysia()
  .use(errorHandler)
  .use(requireRoles(["Admin", "Teacher"]))
  .get("/staff", () => ({ ok: true }));

describe("requireRoles", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
  });

  it("returns 401 when no Authorization header (unauthenticated)", async () => {
    const res = await adminApp.handle(new Request("http://localhost/admin"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when user role does not match", async () => {
    const token = await signToken({ sub: "student-1", username: "stu", roles: "Student" });
    mockFindUnique.mockResolvedValueOnce({
      id: "student-1",
      username: "stu",
      role: "Student",
      status: "active",
    });

    const res = await adminApp.handle(
      new Request("http://localhost/admin", { headers: { Authorization: `Bearer ${token}` } }),
    );
    expect(res.status).toBe(403);
  });

  it("returns 200 when user role matches", async () => {
    const token = await signToken({ sub: "admin-1", username: "admin", roles: "Admin" });
    mockFindUnique.mockResolvedValueOnce({
      id: "admin-1",
      username: "admin",
      role: "Admin",
      status: "active",
    });

    const res = await adminApp.handle(
      new Request("http://localhost/admin", { headers: { Authorization: `Bearer ${token}` } }),
    );
    expect(res.status).toBe(200);
  });

  it("allows any matching role in multi-role list", async () => {
    const teacherToken = await signToken({ sub: "teacher-1", username: "teacher", roles: "Teacher" });
    mockFindUnique.mockResolvedValueOnce({
      id: "teacher-1",
      username: "teacher",
      role: "Teacher",
      status: "active",
    });

    const res = await multiRoleApp.handle(
      new Request("http://localhost/staff", { headers: { Authorization: `Bearer ${teacherToken}` } }),
    );
    expect(res.status).toBe(200);
  });

  it("blocks role not in multi-role list", async () => {
    const studentToken = await signToken({ sub: "student-2", username: "stu2", roles: "Student" });
    mockFindUnique.mockResolvedValueOnce({
      id: "student-2",
      username: "stu2",
      role: "Student",
      status: "active",
    });

    const res = await multiRoleApp.handle(
      new Request("http://localhost/staff", { headers: { Authorization: `Bearer ${studentToken}` } }),
    );
    expect(res.status).toBe(403);
  });

  it("uses fresh role from DB not from JWT payload", async () => {
    // JWT says Student but DB returns Admin → should pass Admin route
    const token = await signToken({ sub: "role-swap", username: "swap", roles: "Student" });
    mockFindUnique.mockResolvedValueOnce({
      id: "role-swap",
      username: "swap",
      role: "Admin",
      status: "active",
    });

    const res = await adminApp.handle(
      new Request("http://localhost/admin", { headers: { Authorization: `Bearer ${token}` } }),
    );
    expect(res.status).toBe(200);
  });
});
