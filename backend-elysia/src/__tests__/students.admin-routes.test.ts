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
const { authGuard } = await import("@/middleware/auth");
type JwtPayload = import("@/middleware/auth").JwtPayload;
const { UnauthorizedError, ForbiddenError } = await import("@/libs/errors");
const { errorHandler } = await import("@/plugins/error-handler");

// Replicate the requireAdmin helper exactly as in students/index.ts
function requireAdmin(user: unknown): JwtPayload {
  const payload = user as JwtPayload | null;
  if (!payload) throw new UnauthorizedError();
  if (payload.roles !== "Admin") throw new ForbiddenError();
  return payload;
}

const testApp = new Elysia()
  .use(errorHandler)
  .use(authGuard)
  .delete("/students/classroom/:id", ({ params: { id }, user }) => {
    const payload = requireAdmin(user);
    return { deleted: 0, classroom: "Test", calledBy: payload.sub };
  })
  .post("/students/promote-classroom", ({ user }) => {
    requireAdmin(user);
    return { ok: true };
  });

async function signToken(payload: Record<string, unknown>): Promise<string> {
  const res = await new Elysia()
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .get("/sign", ({ jwt }: { jwt: { sign: (p: unknown) => Promise<string> } }) =>
      jwt.sign(payload),
    )
    .handle(new Request("http://localhost/sign"));
  return res.text();
}

describe("students admin routes: requireAdmin", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
  });

  it("returns 401 when no Authorization header", async () => {
    const res = await testApp.handle(
      new Request("http://localhost/students/classroom/abc123", { method: "DELETE" }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 errorCode UNAUTHORIZED with no token", async () => {
    const res = await testApp.handle(
      new Request("http://localhost/students/classroom/abc123", { method: "DELETE" }),
    );
    const body = await res.json() as Record<string, unknown>;
    expect(body.errorCode).toBe("UNAUTHORIZED");
    expect(body.success).toBe(false);
  });

  it("returns 403 when user role is not Admin", async () => {
    const token = await signToken({ sub: "teacher-x", username: "teacher", roles: "Teacher" });
    mockFindUnique.mockResolvedValueOnce({
      id: "teacher-x",
      username: "teacher",
      role: "Teacher",
      status: "active",
    });

    const res = await testApp.handle(
      new Request("http://localhost/students/classroom/abc123", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    expect(res.status).toBe(403);
  });

  it("returns 403 errorCode FORBIDDEN for non-admin", async () => {
    const token = await signToken({ sub: "student-x", username: "student", roles: "Student" });
    mockFindUnique.mockResolvedValueOnce({
      id: "student-x",
      username: "student",
      role: "Student",
      status: "active",
    });

    const res = await testApp.handle(
      new Request("http://localhost/students/classroom/abc123", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    const body = await res.json() as Record<string, unknown>;
    expect(body.errorCode).toBe("FORBIDDEN");
  });

  it("returns 200 when user is Admin", async () => {
    const token = await signToken({ sub: "admin-x", username: "admin", roles: "Admin" });
    mockFindUnique.mockResolvedValueOnce({
      id: "admin-x",
      username: "admin",
      role: "Admin",
      status: "active",
    });

    const res = await testApp.handle(
      new Request("http://localhost/students/classroom/room-1", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.calledBy).toBe("admin-x");
  });

  it("promote-classroom also returns 401 with no token", async () => {
    const res = await testApp.handle(
      new Request("http://localhost/students/promote-classroom", { method: "POST" }),
    );
    expect(res.status).toBe(401);
  });

  it("promote-classroom returns 403 for non-admin", async () => {
    const token = await signToken({ sub: "user-x", username: "user", roles: "User" });
    mockFindUnique.mockResolvedValueOnce({
      id: "user-x",
      username: "user",
      role: "User",
      status: "active",
    });

    const res = await testApp.handle(
      new Request("http://localhost/students/promote-classroom", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    expect(res.status).toBe(403);
  });
});
