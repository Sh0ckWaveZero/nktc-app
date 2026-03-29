import { Elysia } from "elysia";
import { DepartmentService } from "./service";
import { authGuard } from "@/middleware/auth";

export const departments = new Elysia({ prefix: "/departments" })
	.use(authGuard)
	.get("/", async () => {
		return DepartmentService.getAll();
	});