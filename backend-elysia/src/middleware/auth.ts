import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authGuard = new Elysia({ name: "auth-guard" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "supersecret",
    })
  )
  .derive({ as: "global" }, async ({ headers, jwt, set }) => {
    const authHeader = headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      set.status = 401;
      return { user: null };
    }
    const token = authHeader.slice(7);
    const payload = await jwt.verify(token);
    if (!payload) {
      set.status = 401;
      return { user: null };
    }
    return {
      user: payload as { sub: string; username: string; roles: string },
    };
  });