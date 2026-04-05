import { Elysia } from "elysia";
import { DepartmentService } from "./service";
import { authGuard } from "@/middleware/auth";

export const departments = new Elysia({ prefix: "/departments" })
	.use(authGuard)
	.guard({
		detail: {
			tags: ["Reference-Data"],
			security: [{ BearerAuth: [] }],
		},
	}, (app) =>
		app.get("/", async () => {
			return DepartmentService.getAll();
		}, {
			detail: {
				summary: "Get all academic departments",
			},
		}),
	);