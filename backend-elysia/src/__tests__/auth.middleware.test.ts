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
const { errorHandler } = await import("@/plugins/error-handler");

// Sign tokens using the same JWT plugin as the app
async function signToken(payload: Record<string, unknown>): Promise<string> {
  const res = await new Elysia()
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .get("/sign", ({ jwt }: { jwt: { sign: (p: unknown) => Promise<string> } }) =>
      jwt.sign(payload),
    )
    .handle(new Request("http://localhost/sign"));
  return res.text();
}

const testApp = new Elysia()
  .use(errorHandler)
  .use(authGuard)
  .get("/me", ({ user }) => ({ user }));

describe("authGuard", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const res = await testApp.handle(new Request("http://localhost/me"));
    expect(res.status).toBe(401);
  });

  it("returns 401 when token is malformed", async () => {
    const res = await testApp.handle(
      new Request("http://localhost/me", {
        headers: { Authorization: "Bearer not.a.valid.jwt" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 when user not found in DB", async () => {
    const token = await signToken({ sub: "ghost-user", username: "ghost", roles: "Admin" });
    mockFindUnique.mockResolvedValueOnce(null);

    const res = await testApp.handle(
      new Request("http://localhost/me", { headers: { Authorization: `Bearer ${token}` } }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 when user status is not active", async () => {
    const token = await signToken({ sub: "inactive-1", username: "inactive", roles: "User" });
    mockFindUnique.mockResolvedValueOnce({
      id: "inactive-1",
      username: "inactive",
      role: "User",
      status: "disabled",
    });

    const res = await testApp.handle(
      new Request("http://localhost/me", { headers: { Authorization: `Bearer ${token}` } }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 with user on valid token + active status", async () => {
    const token = await signToken({ sub: "active-1", username: "alice", roles: "Admin" });
    mockFindUnique.mockResolvedValueOnce({
      id: "active-1",
      username: "alice",
      role: "Admin",
      status: "active",
    });

    const res = await testApp.handle(
      new Request("http://localhost/me", { headers: { Authorization: `Bearer ${token}` } }),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { user: { sub: string; username: string; roles: string } };
    expect(body.user.sub).toBe("active-1");
    expect(body.user.username).toBe("alice");
    expect(body.user.roles).toBe("Admin");
  });

  it("returns 200 with user on legacy capitalized Active status", async () => {
    const token = await signToken({ sub: "legacy-active-1", username: "legacy", roles: "Teacher" });
    mockFindUnique.mockResolvedValueOnce({
      id: "legacy-active-1",
      username: "legacy",
      role: "Teacher",
      status: "Active",
    });

    const res = await testApp.handle(
      new Request("http://localhost/me", { headers: { Authorization: `Bearer ${token}` } }),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { user: { sub: string; username: string; roles: string } };
    expect(body.user.sub).toBe("legacy-active-1");
    expect(body.user.username).toBe("legacy");
    expect(body.user.roles).toBe("Teacher");
  });

  it("returns fresh role from DB, not from JWT payload", async () => {
    // JWT says "User" but DB has "Admin"
    const token = await signToken({ sub: "role-mismatch", username: "charlie", roles: "User" });
    mockFindUnique.mockResolvedValueOnce({
      id: "role-mismatch",
      username: "charlie",
      role: "Admin",
      status: "active",
    });

    const res = await testApp.handle(
      new Request("http://localhost/me", { headers: { Authorization: `Bearer ${token}` } }),
    );
    const body = await res.json() as { user: { roles: string } };
    expect(body.user.roles).toBe("Admin");
  });

  it("hits DB only once for repeated requests with same sub (cache)", async () => {
    const token = await signToken({ sub: "cache-user", username: "cached", roles: "User" });
    mockFindUnique.mockResolvedValue({
      id: "cache-user",
      username: "cached",
      role: "User",
      status: "active",
    });

    for (let i = 0; i < 3; i++) {
      await testApp.handle(
        new Request("http://localhost/me", { headers: { Authorization: `Bearer ${token}` } }),
      );
    }

    expect(mockFindUnique).toHaveBeenCalledTimes(1);
  });

  it("returns 401 for deactivated user not yet in cache", async () => {
    const token = await signToken({ sub: "deact-user", username: "deact", roles: "User" });
    mockFindUnique.mockResolvedValueOnce({
      id: "deact-user",
      username: "deact",
      role: "User",
      status: "inactive",
    });

    const res = await testApp.handle(
      new Request("http://localhost/me", { headers: { Authorization: `Bearer ${token}` } }),
    );
    expect(res.status).toBe(401);
  });
});
