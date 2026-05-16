import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./service";
import { AuthModel } from "./model";
import { prisma } from "@/libs/prisma";
import { UnauthorizedError, ForbiddenError } from "@/libs/errors";
import { loginRateLimiter, refreshRateLimiter, registerRateLimiter, extractIp } from "@/middleware/rate-limiter";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET environment variable is required");

const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
if (!jwtRefreshSecret) throw new Error("JWT_REFRESH_SECRET environment variable is required");

export const auth = new Elysia({ prefix: "/auth" })
	.use(
		jwt({
			name: "jwt",
			secret: jwtSecret,
		}),
	)
	.use(
		jwt({
			name: "refreshJwt",
			secret: jwtRefreshSecret,
			exp: "7d",
		}),
	)
	.guard({ detail: { tags: ["Auth"] } }, (app) =>
		app
			.post(
				"/register",
				async ({ body, set, headers }) => {
					if (process.env.NODE_ENV === "production" && !process.env.ALLOW_REGISTRATION) {
						throw new ForbiddenError("Registration is disabled in production");
					}

					const regSecret = headers["x-registration-secret"];
					if (process.env.REGISTRATION_SECRET && regSecret !== process.env.REGISTRATION_SECRET) {
						throw new ForbiddenError("Invalid registration secret");
					}

					registerRateLimiter.checkOrThrow(extractIp(headers), "Too many registration attempts");

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
					detail: {
						summary: "Register a new account",
						description: "Create a new user account with student or teacher role",
					},
				},
			)
			.post(
				"/login",
				async ({ body, jwt, refreshJwt, headers, set }) => {
					loginRateLimiter.checkOrThrow(extractIp(headers), "Too many login attempts");

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
					detail: {
						summary: "Login to account",
						description: "Authenticate user and return JWT tokens",
					},
				},
			)
			.post(
				"/refresh",
				async ({ body, jwt, refreshJwt, headers }) => {
					refreshRateLimiter.checkOrThrow(extractIp(headers), "Too many refresh attempts");

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

					const newRefreshToken = await refreshJwt.sign({
						sub: result.userId,
						username: result.username,
					});

					const hashedNewRefreshToken = await AuthService.hashToken(newRefreshToken);
					await prisma.user.update({
						where: { id: result.userId },
						data: { refreshToken: hashedNewRefreshToken },
					});

					return { token: newToken, refreshToken: newRefreshToken };
				},
				{
					body: AuthModel.refresh,
					detail: {
						summary: "Refresh JWT token",
						description: "Get a new access token using a valid refresh token. Returns a new refresh token (rotation).",
					},
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
			.guard({ detail: { security: [{ BearerAuth: [] }] } }, (guarded) =>
				guarded
					.get(
						"/me",
						async ({ user }) => {
							if (!user) {
								throw new UnauthorizedError();
							}
							return AuthService.getUser(user.sub as string);
						},
						{
							detail: {
								summary: "Get current user profile",
							},
						},
					)
					.post(
						"/logout",
						async ({ user }) => {
							if (!user) {
								throw new UnauthorizedError();
							}
							await AuthService.logout(user.sub as string);
							return { success: true, message: "Logged out successfully" };
						},
						{
							detail: {
								summary: "Logout from account",
							},
						},
					)
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
							detail: {
								summary: "Update account password",
							},
						},
					),
			),
	);
