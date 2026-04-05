import { Elysia } from "elysia";
import { AuditLogService } from "./service";
import { authGuard } from "@/middleware/auth";

export const auditLog = new Elysia({ prefix: "/audit-log" })
	.use(authGuard)
	.guard({
		detail: {
			tags: ["Audit-Logs"],
			security: [{ BearerAuth: [] }],
		},
	}, (app) =>
		app.get("/:username", async ({ params: { username } }) => {
			return AuditLogService.getByUsername(username);
		}, {
			detail: {
				summary: "Get audit logs by username",
			},
		}),
	);