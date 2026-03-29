import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./service";
import { AuthModel } from "./model";
import { prisma } from "@/libs/prisma";

export const auth = new Elysia({ prefix: "/auth" })
	.use(
		jwt({
			name: "jwt",
			secret: process.env.JWT_SECRET || "supersecret",
		}),
	)
	.use(
		jwt({
			name: "refreshJwt",
			secret: process.env.JWT_REFRESH_SECRET || "superrefreshsecret",
			exp: "7d",
		}),
	)
	.post(
		"/register",
		async ({ body, set }) => {
			try {
				const user = await AuthService.register(body);
				return {
					success: true,
					message: "ACCOUNT_CREATE_SUCCESS",
					data: user,
				};
			} catch (error: any) {
				set.status = error.status || 500;
				return {
					success: false,
					message: error.message || "Registration failed",
				};
			}
		},
		{
			body: AuthModel.register,
		},
	)
	.post(
		"/login",
		async ({ body, jwt, refreshJwt, set }) => {
			try {
				const result = await AuthService.login(body);

				const payload = {
					sub: result.userId,
					username: result.username,
					roles: result.roles,
				};

				const token = await jwt.sign(payload);
				const refreshToken = await refreshJwt.sign({
					sub: result.userId,
					username: result.username,
				});

				const hashedRefreshToken = await AuthService.hashToken(
					refreshToken,
				);
				await prisma.user.update({
					where: { id: result.userId },
					data: { refreshToken: hashedRefreshToken },
				});

				const { password: _, ...userWithoutPassword } = result.user;

				return {
					success: true,
					message: "login successfully",
					data: userWithoutPassword,
					token,
					refreshToken,
				};
			} catch (error: any) {
				set.status = error.status || 500;
				return {
					success: false,
					message: error.message || "Login failed",
				};
			}
		},
		{
			body: AuthModel.login,
		},
	)
	.post(
		"/refresh",
		async ({ body, jwt, refreshJwt, set }) => {
			const { refreshToken } = body;

			const payload = await refreshJwt.verify(refreshToken);
			if (!payload) {
				set.status = 401;
				return { success: false, message: "INVALID_REFRESH_TOKEN" };
			}

			try {
				const result = await AuthService.validateRefreshToken(
					payload.sub as string,
					refreshToken,
				);

				const newToken = await jwt.sign({
					sub: result.userId,
					username: result.username,
					roles: result.roles,
				});

				return { token: newToken };
			} catch (error: any) {
				set.status = error.status || 500;
				return {
					success: false,
					message: error.message || "Token refresh failed",
				};
			}
		},
		{
			body: AuthModel.refresh,
		},
	)
	.derive(async ({ headers, jwt }) => {
		const auth = headers.authorization;
		if (!auth?.startsWith("Bearer ")) {
			return { user: null };
		}

		const token = auth.slice(7);
		const payload = await jwt.verify(token);
		if (!payload) {
			return { user: null };
		}

		return { user: payload };
	})
	.get("/me", async ({ user, set }) => {
		if (!user) {
			set.status = 401;
			return { success: false, message: "Unauthorized" };
		}

		try {
			const userData = await AuthService.getUser(user.sub as string);
			return userData;
		} catch (error: any) {
			set.status = error.status || 500;
			return {
				success: false,
				message: error.message || "Failed to get user",
			};
		}
	})
	.post("/logout", async ({ user, set }) => {
		if (!user) {
			set.status = 401;
			return { success: false, message: "Unauthorized" };
		}

		try {
			await AuthService.logout(user.sub as string);
			return { success: true, message: "Logged out successfully" };
		} catch (error: any) {
			set.status = error.status || 500;
			return {
				success: false,
				message: error.message || "Logout failed",
			};
		}
	})
	.put(
		"/update/password",
		async ({ body, user, set }) => {
			if (!user) {
				set.status = 401;
				return { success: false, message: "Unauthorized" };
			}

			try {
				await AuthService.updatePassword(
					user.sub as string,
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
			body: AuthModel.updatePassword,
		},
	);