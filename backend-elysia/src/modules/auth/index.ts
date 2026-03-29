import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./service";
import { AuthModel } from "./model";
import { prisma } from "@/libs/prisma";
import { UnauthorizedError } from "@/libs/errors";

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
			const user = await AuthService.register(body);
			set.status = 201;
			return {
				success: true,
				message: "ACCOUNT_CREATE_SUCCESS",
				data: user,
			};
		},
		{
			body: AuthModel.register,
		},
	)
	.post(
		"/login",
		async ({ body, jwt, refreshJwt }) => {
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

			const hashedRefreshToken = await AuthService.hashToken(refreshToken);
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
		},
		{
			body: AuthModel.login,
		},
	)
	.post(
		"/refresh",
		async ({ body, jwt, refreshJwt }) => {
			const { refreshToken } = body;

			const payload = await refreshJwt.verify(refreshToken);
			if (!payload) {
				throw new UnauthorizedError("Invalid refresh token");
			}

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
	.get("/me", async ({ user }) => {
		if (!user) {
			throw new UnauthorizedError();
		}
		return AuthService.getUser(user.sub as string);
	})
	.post("/logout", async ({ user }) => {
		if (!user) {
			throw new UnauthorizedError();
		}
		await AuthService.logout(user.sub as string);
		return { success: true, message: "Logged out successfully" };
	})
	.put(
		"/update/password",
		async ({ body, user }) => {
			if (!user) {
				throw new UnauthorizedError();
			}
			await AuthService.updatePassword(user.sub as string, body);
			return { message: "password_update_success" };
		},
		{
			body: AuthModel.updatePassword,
		},
	);
