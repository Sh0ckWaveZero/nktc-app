import { Elysia } from "elysia";
import { LevelService } from "./service";
import { authGuard } from "@/middleware/auth";

export const levels = new Elysia({ prefix: "/levels" })
	.use(authGuard)
	.get("/", async () => {
		return LevelService.getAll();
	});