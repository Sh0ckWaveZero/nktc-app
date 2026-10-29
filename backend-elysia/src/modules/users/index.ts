import { Elysia } from "elysia";
import { UserService } from "./service";
import { UserModel } from "./model";
import { authGuard, type JwtPayload } from "@/middleware/auth";
import { UnauthorizedError, ForbiddenError } from "@/libs/errors";

function requireAdmin(user: unknown): JwtPayload {
	const payload = user as JwtPayload | null;
	if (!payload) throw new UnauthorizedError();
	if (payload.roles !== "Admin") throw new ForbiddenError();
	return payload;
}

export const users = new Elysia({ prefix: "/users" })
	.use(authGuard)
	.guard({
		detail: {
			tags: ["Users"],
			security: [{ BearerAuth: [] }],
		},
	}, (app) =>
		app
			.get("/me", async ({ user }) => {
				return UserService.getUserById((user as any).sub);
			}, {
				detail: {
					summary: "Get current user profile",
				},
			})
			.get("/:id", async ({ params: { id } }) => {
				return UserService.getUserByIdentifier(id);
			}, {
				detail: {
					summary: "Get user profile by identifier (ID or Username)",
				},
			})
			.put(
				"/update/password",
				async ({ body, user }) => {
					await UserService.updatePassword((user as any).sub, body);
					return { message: "password_update_success" };
				},
				{
					body: UserModel.updatePassword,
					detail: {
						summary: "Update current user password",
					},
				},
			)
			.put(
				"/update/password/:id",
				async ({ params: { id }, body, user }) => {
					requireAdmin(user);
					await UserService.updatePasswordByAdmin(id, body.newPassword);
					return { message: "password_update_success" };
				},
				{
					body: UserModel.updatePasswordById,
					detail: {
						summary: "Update user password by Admin",
					},
				},
			)
			.get(
				"/:id/security",
				async ({ params: { id } }) => {
					return UserService.getSecurityStatus(id);
				},
				{
					detail: {
						summary: "Get user security status (MFA, passkey, sessions)",
					},
				},
			)
			.post(
				"/:id/reset-mfa",
				async ({ params: { id }, user }) => {
					const payload = requireAdmin(user);
					const result = await UserService.resetMfa(id, payload.username);
					return { message: "mfa_reset_success", ...result };
				},
				{
					detail: {
						summary: "Admin reset user MFA (TOTP) and revoke sessions",
					},
				},
			)
			.post(
				"/:id/reset-passkey",
				async ({ params: { id }, user }) => {
					const payload = requireAdmin(user);
					const result = await UserService.resetPasskey(id, payload.username);
					return { message: "passkey_reset_success", ...result };
				},
				{
					detail: {
						summary: "Admin reset user passkeys and revoke sessions",
					},
				},
			)
			.get(
				"/audit-logs/:username",
				async ({ params: { username }, query }) => {
					const skip = Number(query.skip ?? 0);
					const take = Number(query.take ?? 20);
					return UserService.getAuditLogsByUsername(username, skip, take);
				},
				{
					query: UserModel.auditLogsQuery,
					detail: {
						summary: "Get audit logs for a user",
					},
				},
			),
	);
