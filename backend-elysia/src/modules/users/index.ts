import { Elysia } from "elysia";
import { UserService } from "./service";
import { UserModel } from "./model";
import { authGuard } from "@/middleware/auth";

export const users = new Elysia({ prefix: "/users" })
	.use(authGuard)
	.get("/me", async ({ user, set }) => {
		try {
			const userData = await UserService.getUserById(
				(user as any).sub,
			);
			return userData;
		} catch (error: any) {
			set.status = error.status || 500;
			return {
				success: false,
				message: error.message || "Failed to get user",
			};
		}
	})
	.get("/:id", async ({ params: { id }, set }) => {
		try {
			const userData = await UserService.getUserByIdentifier(id);
			return userData;
		} catch (error: any) {
			set.status = error.status || 500;
			return {
				success: false,
				message: error.message || "Failed to get user",
			};
		}
	})
	.put(
		"/update/password",
		async ({ body, user, set }) => {
			try {
				await UserService.updatePassword(
					(user as any).sub,
					body,
				);
				return { message: "password_update_success" };
			} catch (error: any) {
				set.status = error.status || 500;
				return {
					success: false,
					message: error.message || "Password update failed",
				};
			}
		},
		{
			body: UserModel.updatePassword,
		},
	)
	.put(
		"/update/password/:id",
		async ({ params: { id }, body, user, set }) => {
			if ((user as any).roles !== "Admin") {
				set.status = 403;
				return { success: false, message: "Forbidden" };
			}

			try {
				await UserService.updatePasswordByAdmin(
					id,
					body.newPassword,
				);
				return { message: "password_update_success" };
			} catch (error: any) {
				set.status = error.status || 500;
				return {
					success: false,
					message: error.message || "Password update failed",
				};
			}
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