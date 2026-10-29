import { describe, it, expect, mock, beforeEach } from "bun:test";

process.env.JWT_SECRET = "test-jwt-secret-minimum-32-chars!!";

// --- Prisma mocks ---
const mockUserFindUnique = mock();
const mockUserFindFirst = mock();
const mockAuthUserFindUnique = mock();
const mockAuthTwoFactorCount = mock();
const mockAuthPasskeyCount = mock();
const mockAuthSessionCount = mock();
const mockAuthTwoFactorDeleteMany = mock();
const mockAuthPasskeyDeleteMany = mock();
const mockAuthSessionDeleteMany = mock();
const mockAuthUserUpdate = mock();
const mockAuditLogCreate = mock();
const mockTeacherFindUnique = mock();
const mockStudentFindUnique = mock();

// Transaction callback receives a client-like object; reuse the same mocks
const txMock = {
	authTwoFactor: { deleteMany: mockAuthTwoFactorDeleteMany },
	authPasskey: { deleteMany: mockAuthPasskeyDeleteMany },
	authSession: { deleteMany: mockAuthSessionDeleteMany },
	authUser: { update: mockAuthUserUpdate },
};

const mockTransaction = mock(async (cb: (tx: typeof txMock) => Promise<unknown>) =>
	cb(txMock),
);

mock.module("@/libs/prisma", () => ({
	prisma: {
		user: { findUnique: mockUserFindUnique, findFirst: mockUserFindFirst },
		teacher: { findUnique: mockTeacherFindUnique },
		student: { findUnique: mockStudentFindUnique },
		authUser: { findUnique: mockAuthUserFindUnique },
		authTwoFactor: { count: mockAuthTwoFactorCount, deleteMany: mockAuthTwoFactorDeleteMany },
		authPasskey: { count: mockAuthPasskeyCount, deleteMany: mockAuthPasskeyDeleteMany },
		authSession: { count: mockAuthSessionCount, deleteMany: mockAuthSessionDeleteMany },
		auditLog: { create: mockAuditLogCreate },
		$transaction: mockTransaction,
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
const { users } = await import("@/modules/users");
const { UserService } = await import("@/modules/users/service");

// Real users module mounted with error handler
const testApp = new Elysia().use(errorHandler).use(users);

async function signToken(payload: Record<string, unknown>): Promise<string> {
	const res = await new Elysia()
		.use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
		.get("/sign", ({ jwt }: { jwt: { sign: (p: unknown) => Promise<string> } }) =>
			jwt.sign(payload),
		)
		.handle(new Request("http://localhost/sign"));
	return res.text();
}

/** ตั้งค่าให้ authGuard ยืนยัน user ตาม role */
function mockAuthUser(sub: string, username: string, role: string) {
	mockUserFindUnique.mockResolvedValueOnce({ id: sub, username, role, status: "active" });
}

describe("users admin security routes", () => {
	beforeEach(() => {
		mockUserFindUnique.mockReset();
		mockUserFindFirst.mockReset();
		mockAuthUserFindUnique.mockReset();
		mockAuthTwoFactorCount.mockReset();
		mockAuthPasskeyCount.mockReset();
		mockAuthSessionCount.mockReset();
		mockAuthTwoFactorDeleteMany.mockReset();
		mockAuthPasskeyDeleteMany.mockReset();
		mockAuthSessionDeleteMany.mockReset();
		mockAuthUserUpdate.mockReset();
		mockAuditLogCreate.mockReset();
		mockTeacherFindUnique.mockReset();
		mockStudentFindUnique.mockReset();
		mockTransaction.mockReset();
		// Re-bind default transaction executor after reset
		mockTransaction.mockImplementation(async (cb: (tx: typeof txMock) => Promise<unknown>) =>
			cb(txMock),
		);
	});

	describe("POST /users/:id/reset-mfa", () => {
		it("returns 401 when no Authorization header", async () => {
			const res = await testApp.handle(
				new Request("http://localhost/users/u-1/reset-mfa", { method: "POST" }),
			);
			expect(res.status).toBe(401);
		});

		it("returns 403 when user role is not Admin", async () => {
			const token = await signToken({ sub: "teacher-1", username: "teacher", roles: "Teacher" });
			mockAuthUser("teacher-1", "teacher", "Teacher");

			const res = await testApp.handle(
				new Request("http://localhost/users/u-1/reset-mfa", {
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
				}),
			);
			expect(res.status).toBe(403);
		});

		it("returns 200 and resets MFA when user is Admin", async () => {
			const token = await signToken({ sub: "admin-1", username: "admin", roles: "Admin" });
			mockAuthUser("admin-1", "admin", "Admin");
			mockUserFindFirst.mockResolvedValueOnce({ id: "u-1", username: "target" });
			mockAuthTwoFactorDeleteMany.mockResolvedValueOnce({ count: 1 });
			mockAuthSessionDeleteMany.mockResolvedValueOnce({ count: 2 });

			const res = await testApp.handle(
				new Request("http://localhost/users/u-1/reset-mfa", {
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
				}),
			);
			expect(res.status).toBe(200);
			const body = (await res.json()) as Record<string, unknown>;
			expect(body.message).toBe("mfa_reset_success");
			expect(body.twoFactorCount).toBe(1);
			expect(body.revokedSessions).toBe(2);

			// Verify transaction operations
			expect(mockAuthTwoFactorDeleteMany).toHaveBeenCalledWith({ where: { userId: "u-1" } });
			expect(mockAuthUserUpdate).toHaveBeenCalledWith({
				where: { id: "u-1" },
				data: { twoFactorEnabled: false },
			});
			expect(mockAuthSessionDeleteMany).toHaveBeenCalledWith({ where: { userId: "u-1" } });
			// Audit log written by admin username
			expect(mockAuditLogCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						action: "ResetMFA",
						recordId: "u-1",
						createdBy: "admin",
					}),
				}),
			);
		});
	});

	describe("POST /users/:id/reset-passkey", () => {
		it("returns 401 when no Authorization header", async () => {
			const res = await testApp.handle(
				new Request("http://localhost/users/u-1/reset-passkey", { method: "POST" }),
			);
			expect(res.status).toBe(401);
		});

		it("returns 403 when user role is not Admin", async () => {
			const token = await signToken({ sub: "user-1", username: "user", roles: "User" });
			mockAuthUser("user-1", "user", "User");

			const res = await testApp.handle(
				new Request("http://localhost/users/u-1/reset-passkey", {
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
				}),
			);
			expect(res.status).toBe(403);
		});

		it("returns 200 and resets passkeys when user is Admin", async () => {
			const token = await signToken({ sub: "admin-1", username: "admin", roles: "Admin" });
			mockAuthUser("admin-1", "admin", "Admin");
			mockUserFindFirst.mockResolvedValueOnce({ id: "u-1", username: "target" });
			mockAuthPasskeyDeleteMany.mockResolvedValueOnce({ count: 3 });
			mockAuthSessionDeleteMany.mockResolvedValueOnce({ count: 1 });

			const res = await testApp.handle(
				new Request("http://localhost/users/u-1/reset-passkey", {
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
				}),
			);
			expect(res.status).toBe(200);
			const body = (await res.json()) as Record<string, unknown>;
			expect(body.message).toBe("passkey_reset_success");
			expect(body.passkeyCount).toBe(3);
			expect(body.revokedSessions).toBe(1);

			expect(mockAuthPasskeyDeleteMany).toHaveBeenCalledWith({ where: { userId: "u-1" } });
			expect(mockAuthSessionDeleteMany).toHaveBeenCalledWith({ where: { userId: "u-1" } });
			expect(mockAuditLogCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						action: "ResetPasskey",
						recordId: "u-1",
						createdBy: "admin",
					}),
				}),
			);
		});
	});

	describe("GET /users/:id/security", () => {
		it("returns 401 when no Authorization header", async () => {
			const res = await testApp.handle(
				new Request("http://localhost/users/u-1/security"),
			);
			expect(res.status).toBe(401);
		});

		it("returns security status for authenticated user", async () => {
			const token = await signToken({ sub: "admin-1", username: "admin", roles: "Admin" });
			mockAuthUser("admin-1", "admin", "Admin");
			mockUserFindFirst.mockResolvedValueOnce({ id: "u-1", username: "target" });
			mockAuthUserFindUnique.mockResolvedValueOnce({ twoFactorEnabled: true });
			mockAuthTwoFactorCount.mockResolvedValueOnce(1);
			mockAuthPasskeyCount.mockResolvedValueOnce(2);
			mockAuthSessionCount.mockResolvedValueOnce(3);

			const res = await testApp.handle(
				new Request("http://localhost/users/u-1/security", {
					headers: { Authorization: `Bearer ${token}` },
				}),
			);
			expect(res.status).toBe(200);
			const body = (await res.json()) as Record<string, unknown>;
			expect(body).toEqual({
				twoFactorEnabled: true,
				twoFactorCount: 1,
				passkeyCount: 2,
				activeSessionCount: 3,
			});
		});

		it("resolves user via teacher.id fallback", async () => {
			const token = await signToken({ sub: "admin-1", username: "admin", roles: "Admin" });
			mockAuthUser("admin-1", "admin", "Admin");
			// user lookup by teacher.id misses, then resolves via teacher relation
			mockUserFindFirst.mockResolvedValueOnce(null);
			mockTeacherFindUnique.mockResolvedValueOnce({
				user: { id: "u-9", username: "teacher-user" },
			});
			mockAuthUserFindUnique.mockResolvedValueOnce({ twoFactorEnabled: false });
			mockAuthTwoFactorCount.mockResolvedValueOnce(0);
			mockAuthPasskeyCount.mockResolvedValueOnce(0);
			mockAuthSessionCount.mockResolvedValueOnce(0);

			const res = await testApp.handle(
				new Request("http://localhost/users/teacher-xyz/security", {
					headers: { Authorization: `Bearer ${token}` },
				}),
			);
			expect(res.status).toBe(200);
			const body = (await res.json()) as Record<string, unknown>;
			expect(body.twoFactorEnabled).toBe(false);
		});
	});

	describe("UserService.resetMfa / resetPasskey (unit)", () => {
		it("resetMfa throws NotFoundError when user not found", async () => {
			mockUserFindFirst.mockResolvedValueOnce(null);
			mockTeacherFindUnique.mockResolvedValueOnce(null);
			mockStudentFindUnique.mockResolvedValueOnce(null);
			await expect(UserService.resetMfa("ghost", "admin")).rejects.toThrow();
		});

		it("resetPasskey throws NotFoundError when user not found", async () => {
			mockUserFindFirst.mockResolvedValueOnce(null);
			mockTeacherFindUnique.mockResolvedValueOnce(null);
			mockStudentFindUnique.mockResolvedValueOnce(null);
			await expect(UserService.resetPasskey("ghost", "admin")).rejects.toThrow();
		});
	});
});
