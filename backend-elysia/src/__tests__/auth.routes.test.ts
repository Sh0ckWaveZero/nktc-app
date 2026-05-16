import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";

process.env.JWT_SECRET = "test-jwt-secret-minimum-32-chars!!";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-minimum-32chars!";

const mockLogin = mock();
const mockRegister = mock();
const mockHashToken = mock(() => Promise.resolve("hashed-token"));
const mockValidateRefresh = mock();
const mockGetUser = mock(() => Promise.resolve({ id: "u1", username: "admin" }));
const mockLogout = mock(() => Promise.resolve());
const mockUpdatePassword = mock(() => Promise.resolve());
const mockUserUpdate = mock(() => Promise.resolve({}));

mock.module("@/modules/auth/service", () => ({
  AuthService: {
    login: mockLogin,
    register: mockRegister,
    hashToken: mockHashToken,
    validateRefreshToken: mockValidateRefresh,
    getUser: mockGetUser,
    logout: mockLogout,
    updatePassword: mockUpdatePassword,
  },
}));

mock.module("@/libs/prisma", () => ({
  prisma: { user: { update: mockUserUpdate, findUnique: mock(() => Promise.resolve(null)) } },
}));

mock.module("@/infrastructure/logging", () => ({
  logger: { info: mock(), warn: mock(), error: mock(), debug: mock() },
  createLogger: () => ({ info: mock(), warn: mock(), error: mock(), debug: mock() }),
}));

const { Elysia } = await import("elysia");
const { errorHandler } = await import("@/plugins/error-handler");
const { auth } = await import("@/modules/auth/index");

const app = new Elysia().use(errorHandler).use(auth);

const VALID_LOGIN_BODY = JSON.stringify({ username: "admin", password: "Admin@1234" });
const JSON_HEADERS = { "Content-Type": "application/json" };

describe("auth routes: registration guards", () => {
  let origNodeEnv: string | undefined;

  beforeEach(() => {
    mockRegister.mockReset();
    origNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = origNodeEnv;
    delete process.env.ALLOW_REGISTRATION;
    delete process.env.REGISTRATION_SECRET;
  });

  it("blocks registration in production when ALLOW_REGISTRATION not set", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.ALLOW_REGISTRATION;

    const res = await app.handle(
      new Request("http://localhost/auth/register", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ username: "new", password: "Pass@123", role: "Student" }),
      }),
    );
    expect(res.status).toBe(403);
  });

  it("allows registration in production when ALLOW_REGISTRATION=true", async () => {
    process.env.NODE_ENV = "production";
    process.env.ALLOW_REGISTRATION = "true";
    mockRegister.mockResolvedValueOnce({ id: "new-user", username: "new" });

    const res = await app.handle(
      new Request("http://localhost/auth/register", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ username: "new", password: "Pass@123", role: "Student" }),
      }),
    );
    expect(res.status).toBe(201);
  });

  it("blocks registration with wrong REGISTRATION_SECRET", async () => {
    process.env.REGISTRATION_SECRET = "correct-secret";

    const res = await app.handle(
      new Request("http://localhost/auth/register", {
        method: "POST",
        headers: { ...JSON_HEADERS, "x-registration-secret": "wrong-secret" },
        body: JSON.stringify({ username: "new", password: "Pass@123", role: "Student" }),
      }),
    );
    expect(res.status).toBe(403);
  });

  it("allows registration with correct REGISTRATION_SECRET", async () => {
    process.env.REGISTRATION_SECRET = "correct-secret";
    mockRegister.mockResolvedValueOnce({ id: "new-user", username: "new" });

    const res = await app.handle(
      new Request("http://localhost/auth/register", {
        method: "POST",
        headers: { ...JSON_HEADERS, "x-registration-secret": "correct-secret" },
        body: JSON.stringify({ username: "new", password: "Pass@123", role: "Student" }),
      }),
    );
    expect(res.status).toBe(201);
  });
});

describe("auth routes: login", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockUserUpdate.mockReset();
    mockUserUpdate.mockResolvedValue({});
  });

  it("returns 200 with token and refreshToken on valid credentials", async () => {
    mockLogin.mockResolvedValueOnce({
      userId: "u1",
      username: "admin",
      roles: "Admin",
      user: { id: "u1", username: "admin", password: "hashed", role: "Admin" },
    });

    const res = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: JSON_HEADERS,
        body: VALID_LOGIN_BODY,
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body.token).toBe("string");
    expect(typeof body.refreshToken).toBe("string");
    expect(body.success).toBe(true);
  });

  it("does not include password in response data", async () => {
    mockLogin.mockResolvedValueOnce({
      userId: "u1",
      username: "admin",
      roles: "Admin",
      user: { id: "u1", username: "admin", password: "hashed-password", role: "Admin" },
    });

    const res = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: JSON_HEADERS,
        body: VALID_LOGIN_BODY,
      }),
    );
    const body = await res.json() as { data: Record<string, unknown> };
    expect(body.data.password).toBeUndefined();
  });
});

describe("auth routes: rate limiting", () => {
  it("returns 429 after exceeding login attempts from same IP", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid credentials"));

    const ip = `test-rate-limit-${Date.now()}`;
    const makeRequest = () =>
      app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { ...JSON_HEADERS, "x-forwarded-for": ip },
          body: VALID_LOGIN_BODY,
        }),
      );

    // loginRateLimiter max = 5
    for (let i = 0; i < 5; i++) await makeRequest();

    const res = await makeRequest(); // 6th request
    expect(res.status).toBe(429);
    const body = await res.json() as Record<string, unknown>;
    expect(body.errorCode).toBe("RATE_LIMITED");
    expect(typeof body.retryAfter).toBe("number");
  });

  it("returns 429 after exceeding register attempts from same IP", async () => {
    mockRegister.mockRejectedValue(new Error("Conflict"));

    const ip = `test-reg-rate-${Date.now()}`;
    const makeRequest = () =>
      app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { ...JSON_HEADERS, "x-forwarded-for": ip },
          body: JSON.stringify({ username: "x", password: "Pass@123", role: "Student" }),
        }),
      );

    // registerRateLimiter max = 3
    for (let i = 0; i < 3; i++) await makeRequest();

    const res = await makeRequest(); // 4th request
    expect(res.status).toBe(429);
  });

  it("rate limits different IPs independently", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid"));

    const ip1 = `ip-a-${Date.now()}`;
    const ip2 = `ip-b-${Date.now()}`;

    // Exhaust rate limit for ip1
    for (let i = 0; i < 6; i++) {
      await app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { ...JSON_HEADERS, "x-forwarded-for": ip1 },
          body: VALID_LOGIN_BODY,
        }),
      );
    }

    // ip2 should still be allowed (not rate limited)
    mockLogin.mockResolvedValueOnce({
      userId: "u2",
      username: "user2",
      roles: "User",
      user: { id: "u2", username: "user2", password: "h", role: "User" },
    });

    const res = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: { ...JSON_HEADERS, "x-forwarded-for": ip2 },
        body: VALID_LOGIN_BODY,
      }),
    );
    expect(res.status).toBe(200);
  });
});

// ─── Helper: sign a real JWT via app ────────────────────────────────────────

async function signAuthToken(payload: Record<string, unknown>): Promise<string> {
  const { Elysia: E2 } = await import("elysia");
  const { jwt: jwtPlugin } = await import("@elysiajs/jwt");
  const res = await new E2()
    .use(jwtPlugin({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .get("/sign", ({ jwt }: any) => jwt.sign(payload))
    .handle(new Request("http://localhost/sign"));
  return res.text();
}

async function signRefreshToken(payload: Record<string, unknown>): Promise<string> {
  const { Elysia: E2 } = await import("elysia");
  const { jwt: jwtPlugin } = await import("@elysiajs/jwt");
  const res = await new E2()
    .use(jwtPlugin({ name: "refreshJwt", secret: process.env.JWT_REFRESH_SECRET!, exp: "7d" }))
    .get("/sign", ({ refreshJwt }: any) => refreshJwt.sign(payload))
    .handle(new Request("http://localhost/sign"));
  return res.text();
}

describe("auth routes: refresh", () => {
  beforeEach(() => {
    mockValidateRefresh.mockReset();
    mockHashToken.mockReset();
    mockHashToken.mockResolvedValue("hashed-token");
    mockUserUpdate.mockReset();
    mockUserUpdate.mockResolvedValue({});
  });

  it("returns new token and refreshToken on valid refresh token", async () => {
    const refreshToken = await signRefreshToken({ sub: "u1", username: "admin" });
    mockValidateRefresh.mockResolvedValueOnce({ userId: "u1", username: "admin", roles: "Admin" });

    const res = await app.handle(
      new Request("http://localhost/auth/refresh", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ refreshToken }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body.token).toBe("string");
    expect(typeof body.refreshToken).toBe("string");
  });

  it("returns 401 for invalid refresh token", async () => {
    const res = await app.handle(
      new Request("http://localhost/auth/refresh", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ refreshToken: "bad.token.value" }),
      }),
    );
    expect(res.status).toBe(401);
  });
});

describe("auth routes: /me, /logout, /update/password", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockLogout.mockReset();
    mockUpdatePassword.mockReset();
    mockGetUser.mockResolvedValue({ id: "u1", username: "admin" });
    mockLogout.mockResolvedValue(undefined);
    mockUpdatePassword.mockResolvedValue(undefined);
  });

  it("GET /auth/me returns 401 without token", async () => {
    const res = await app.handle(new Request("http://localhost/auth/me"));
    expect(res.status).toBe(401);
  });

  it("GET /auth/me returns user with valid token", async () => {
    const token = await signAuthToken({ sub: "u1", username: "admin", roles: "Admin" });

    const res = await app.handle(
      new Request("http://localhost/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    expect(res.status).toBe(200);
  });

  it("POST /auth/logout returns 401 without token", async () => {
    const res = await app.handle(
      new Request("http://localhost/auth/logout", { method: "POST" }),
    );
    expect(res.status).toBe(401);
  });

  it("POST /auth/logout returns success with valid token", async () => {
    const token = await signAuthToken({ sub: "u1", username: "admin", roles: "Admin" });

    const res = await app.handle(
      new Request("http://localhost/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });

  it("PUT /auth/update/password returns 401 without token", async () => {
    const res = await app.handle(
      new Request("http://localhost/auth/update/password", {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify({ currentPassword: "old", newPassword: "New@1234", confirmPassword: "New@1234" }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("PUT /auth/update/password succeeds with valid token", async () => {
    const token = await signAuthToken({ sub: "u1", username: "admin", roles: "Admin" });

    const res = await app.handle(
      new Request("http://localhost/auth/update/password", {
        method: "PUT",
        headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: "old", newPassword: "New@1234", confirmPassword: "New@1234" }),
      }),
    );
    expect(res.status).toBe(200);
  });
});
