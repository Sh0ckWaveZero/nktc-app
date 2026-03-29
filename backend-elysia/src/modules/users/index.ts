import { Elysia } from "elysia";
import { UserService } from "./service";
import { UserModel } from "./model";
import { authGuard } from "@/middleware/auth";
import { ForbiddenError } from "@/libs/errors";

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
					if ((user as any).roles !== "Admin") {
						throw new ForbiddenError();
					}
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
