import { Elysia } from "elysia";
import { authGuard } from "./auth";

export const requireRoles = (roles: string[]) =>
  new Elysia({ name: `rbac-${roles.join(",")}` })
    .use(authGuard)
    .onBeforeHandle({ as: "global" }, ({ user, set }) => {
      if (!roles.includes((user as any).roles)) {
        set.status = 403;
        return { success: false, message: "Forbidden" };
      }
    });