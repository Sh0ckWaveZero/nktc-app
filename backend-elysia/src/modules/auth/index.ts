import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./service";
import { AuthModel } from "./model";
import { prisma } from "@/libs/prisma";
import { UnauthorizedError, ForbiddenError } from "@/libs/errors";
import {
  loginRateLimiter,
  refreshRateLimiter,
  registerRateLimiter,
  extractIp,
} from "@/middleware/rate-limiter";
import { createLogger } from "@/infrastructure/logging";
import { auth as betterAuthServer } from "@/libs/better-auth";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET environment variable is required");

const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
if (!jwtRefreshSecret)
  throw new Error("JWT_REFRESH_SECRET environment variable is required");

const isRegistrationAllowed = (): boolean =>
  process.env.ALLOW_REGISTRATION?.trim().toLowerCase() === "true";

const log = createLogger();

interface TokenSigner {
  sign: (payload: {
    sub: string;
    username: string;
    roles?: string;
  }) => Promise<string>;
}

const issueLegacyTokens = async (
  identity: { userId: string; username: string; roles: string },
  jwt: TokenSigner,
  refreshJwt: TokenSigner
) => {
  const token = await jwt.sign({
    sub: identity.userId,
    username: identity.username,
    roles: identity.roles,
  });
  const refreshToken = await refreshJwt.sign({
    sub: identity.userId,
    username: identity.username,
  });
  const hashedRefreshToken = await AuthService.hashToken(refreshToken);

  await prisma.user.update({
    where: { id: identity.userId },
    data: { refreshToken: hashedRefreshToken },
  });

  return { token, refreshToken };
};

const writeLoginAudit = async (
  identity: { userId: string; username: string },
  headers: Record<string, string | undefined>
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        action: "Login",
        model: "User",
        recordId: identity.userId,
        detail: `User ${identity.username} logged in`,
        ipAddr: extractIp(headers),
        browser: headers["user-agent"] ?? null,
        createdBy: identity.username,
      },
    });
  } catch (error) {
    log.warn("[auth] failed to write login audit log", {
      userId: identity.userId,
      username: identity.username,
      error,
    });
  }
};

export const auth = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: jwtSecret,
    })
  )
  .use(
    jwt({
      name: "refreshJwt",
      secret: jwtRefreshSecret,
      exp: "7d",
    })
  )
  .guard({ detail: { tags: ["Auth"] } }, (app) =>
    app
      .post(
        "/prepare-better-auth",
        async ({ body, headers }) => {
          loginRateLimiter.checkOrThrow(
            extractIp(headers),
            "Too many login attempts"
          );
          const user = await AuthService.prepareBetterAuthLogin(body);
          return { success: true, data: user };
        },
        {
          body: AuthModel.login,
          detail: {
            summary: "Prepare an existing account for Better Auth",
            description:
              "Verify legacy credentials and synchronize the Better Auth credential account",
          },
        }
      )
      .post(
        "/token-exchange",
        async ({ request, jwt, refreshJwt, headers }) => {
          const session = await betterAuthServer.api.getSession({
            headers: request.headers,
          });
          if (!session) {
            throw new UnauthorizedError("Better Auth session is required");
          }

          const user = await AuthService.getUser(session.user.id);
          const normalizedStatus = user.status?.trim().toLowerCase();
          if (normalizedStatus && normalizedStatus !== "active") {
            throw new UnauthorizedError("Account is inactive");
          }

          const identity = {
            userId: user.id,
            username: user.username,
            roles: user.role,
          };
          const tokens = await issueLegacyTokens(identity, jwt, refreshJwt);
          await writeLoginAudit(identity, headers);

          return {
            success: true,
            message: "login successfully",
            data: user,
            ...tokens,
          };
        },
        {
          detail: {
            summary: "Exchange a Better Auth session for legacy JWT tokens",
          },
        }
      )
      .post(
        "/register",
        async ({ body, set, headers }) => {
          if (
            process.env.NODE_ENV === "production" &&
            !isRegistrationAllowed()
          ) {
            throw new ForbiddenError("Registration is disabled in production");
          }

          const regSecret = headers["x-registration-secret"];
          if (
            process.env.REGISTRATION_SECRET &&
            regSecret !== process.env.REGISTRATION_SECRET
          ) {
            throw new ForbiddenError("Invalid registration secret");
          }

          registerRateLimiter.checkOrThrow(
            extractIp(headers),
            "Too many registration attempts"
          );

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
            description:
              "Create a new user account with student or teacher role",
          },
        }
      )
      .post(
        "/login",
        async ({ body, jwt, refreshJwt, headers }) => {
          const clientIp = extractIp(headers);

          loginRateLimiter.checkOrThrow(clientIp, "Too many login attempts");

          const result = await AuthService.login(body);
          if (await AuthService.isMfaEnabled(result.userId)) {
            throw new UnauthorizedError("MFA_REQUIRED");
          }

          const identity = {
            userId: result.userId,
            username: result.username,
            roles: result.roles,
          };

          const { token, refreshToken } = await issueLegacyTokens(
            identity,
            jwt,
            refreshJwt
          );
          await writeLoginAudit(result, headers);

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
        }
      )
      .post(
        "/refresh",
        async ({ body, jwt, refreshJwt, headers }) => {
          refreshRateLimiter.checkOrThrow(
            extractIp(headers),
            "Too many refresh attempts"
          );

          const { refreshToken } = body;

          const payload = await refreshJwt.verify(refreshToken);
          if (!payload) {
            throw new UnauthorizedError("Invalid refresh token");
          }

          const result = await AuthService.validateRefreshToken(
            payload.sub as string,
            refreshToken
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

          const hashedNewRefreshToken = await AuthService.hashToken(
            newRefreshToken
          );
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
            description:
              "Get a new access token using a valid refresh token. Returns a new refresh token (rotation).",
          },
        }
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
            }
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
            }
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
            }
          )
      )
  );
