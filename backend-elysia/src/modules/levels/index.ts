import { Elysia } from "elysia";
import { LevelService } from "./service";
import { authGuard } from "@/middleware/auth";

export const levels = new Elysia({ prefix: "/levels" })
	.use(authGuard)
	.guard({
		detail: {
			tags: ["Reference-Data"],
			security: [{ BearerAuth: [] }],
		},
	}, (app) =>
		app.get("/", async () => {
			return LevelService.getAll();
		}, {
			detail: {
				summary: "Get all educational levels",
			},
		}),
	);