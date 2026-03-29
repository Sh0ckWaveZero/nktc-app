import { Elysia } from "elysia";
import { AuditLogService } from "./service";
import { authGuard } from "@/middleware/auth";

export const auditLog = new Elysia({ prefix: "/audit-log" })
	.use(authGuard)
	.get("/:username", async ({ params: { username } }) => {
		return AuditLogService.getByUsername(username);
	});