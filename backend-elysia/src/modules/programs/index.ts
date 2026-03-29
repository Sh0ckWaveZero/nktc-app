import { Elysia } from "elysia";
import { ProgramService } from "./service";
import { ProgramModel } from "./model";
import { authGuard } from "@/middleware/auth";
import { ForbiddenError } from "@/libs/errors";

export const programs = new Elysia({ prefix: "/programs" })
	.use(authGuard)
	.get("/", async () => {
		return ProgramService.getAll();
	})
	.get("/:id", async ({ params: { id } }) => {
		return ProgramService.getById(id);
	})
	.post(
		"/",
		async ({ body, user, set }) => {
			if ((user as any).roles !== "Admin") {
				throw new ForbiddenError();
			}
			const program = await ProgramService.create(body);
			set.status = 201;
			return program;
		},
		{ body: ProgramModel.programBody },
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, user }) => {
			if ((user as any).roles !== "Admin") {
				throw new ForbiddenError();
			}
			return ProgramService.update(id, body);
		},
		{ body: ProgramModel.programPartial },
	)
	.delete("/:id", async ({ params: { id }, user }) => {
		if ((user as any).roles !== "Admin") {
			throw new ForbiddenError();
		}
		await ProgramService.delete(id);
		return { success: true, message: "Program deleted" };
	});
