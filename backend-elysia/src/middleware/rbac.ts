import { Elysia } from "elysia";
import { authGuard, type JwtPayload } from "./auth";

export type { JwtPayload };

export const requireRoles = (roles: string[]) =>
  new Elysia({ name: `rbac-${roles.join(",")}` })
    .use(authGuard)
    .onBeforeHandle({ as: "global" }, ({ user, set }) => {
      const payload = user as JwtPayload | null;
      if (!payload) {
        set.status = 401;
        return { success: false, message: "Unauthorized" };
      }
      if (!roles.includes(payload.roles)) {
        set.status = 403;
        return { success: false, message: "Forbidden" };
      }
    });