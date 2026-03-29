import { Elysia } from "elysia";
import { UserService } from "./service";
import { UserModel } from "./model";
import { authGuard } from "@/middleware/auth";
import { ForbiddenError } from "@/libs/errors";

export const users = new Elysia({ prefix: "/users" })
	.use(authGuard)
	.get("/me", async ({ user }) => {
		return UserService.getUserById((user as any).sub);
	})
	.get("/:id", async ({ params: { id } }) => {
		return UserService.getUserByIdentifier(id);
	})
	.put(
		"/update/password",
		async ({ body, user }) => {
			await UserService.updatePassword((user as any).sub, body);
			return { message: "password_update_success" };
		},
		{
			body: UserModel.updatePassword,
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
		},
	);
