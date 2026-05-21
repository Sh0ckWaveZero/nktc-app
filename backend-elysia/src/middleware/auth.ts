import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { prisma } from "@/libs/prisma";
import { UnauthorizedError } from "@/libs/errors";

export type JwtPayload = { sub: string; username: string; roles: string };

type CacheEntry = { user: JwtPayload; expiresAt: number };
const userCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;

const _jwtSecret = process.env.JWT_SECRET;
if (!_jwtSecret) throw new Error("JWT_SECRET environment variable is required");

export const authGuard = new Elysia({ name: "auth-guard" })
  .use(jwt({ name: "jwt", secret: _jwtSecret }))
  .derive({ as: "global" }, async ({ headers, jwt }) => {
    const authHeader = headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return { user: null };
    }
    const token = authHeader.slice(7);
    const payload = await jwt.verify(token);
    if (!payload) {
      return { user: null };
    }

    const sub = payload.sub as string;
    const cached = userCache.get(sub);
    if (cached && cached.expiresAt > Date.now()) {
      return { user: cached.user };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: sub },
      select: { id: true, username: true, role: true, status: true },
    });

    const normalizedStatus = dbUser?.status?.trim().toLowerCase();

    if (!dbUser || (normalizedStatus && normalizedStatus !== "active")) {
      userCache.delete(sub);
      return { user: null };
    }

    const user: JwtPayload = { sub: dbUser.id, username: dbUser.username, roles: dbUser.role as string };
    userCache.set(sub, { user, expiresAt: Date.now() + CACHE_TTL_MS });
    return { user };
  })
  .onBeforeHandle({ as: "global" }, ({ user }) => {
    if (!user) throw new UnauthorizedError();
  });