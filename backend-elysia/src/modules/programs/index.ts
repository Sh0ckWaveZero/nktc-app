import { Elysia } from "elysia";
import { ProgramService } from "./service";
import { ProgramModel } from "./model";
import { authGuard } from "@/middleware/auth";

export const programs = new Elysia({ prefix: "/programs" })
	.use(authGuard)
	.get("/", async () => {
		return ProgramService.getAll();
	})
	.get("/:id", async ({ params: { id }, set }) => {
		try {
			return await ProgramService.getById(id);
		} catch (error: any) {
			set.status = error.status || 500;
			return { success: false, message: error.message };
		}
	})
	.post(
		"/",
		async ({ body, user, set }) => {
			if ((user as any).roles !== "Admin") {
				set.status = 403;
				return { success: false, message: "Forbidden" };
			}
			const program = await ProgramService.create(body);
			set.status = 201;
			return program;
		},
		{ body: ProgramModel.programBody },
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, user, set }) => {
			if ((user as any).roles !== "Admin") {
				set.status = 403;
				return { success: false, message: "Forbidden" };
			}
			return ProgramService.update(id, body);
		},
		{ body: ProgramModel.programPartial },
	)
	.delete("/:id", async ({ params: { id }, user, set }) => {
		if ((user as any).roles !== "Admin") {
			set.status = 403;
			return { success: false, message: "Forbidden" };
		}
		await ProgramService.delete(id);
		return { success: true, message: "Program deleted" };
	});