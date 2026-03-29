import { Elysia, t } from "elysia";
import { ClassroomService } from "./service";
import { ClassroomModel } from "./model";
import { authGuard } from "@/middleware/auth";

export const classrooms = new Elysia({ prefix: "/classrooms" })
	.use(authGuard)
	.get("/", async () => {
		return ClassroomService.getAll();
	})
	.post(
		"/",
		async ({ body, set }) => {
			const classroom = await ClassroomService.create(body);
			set.status = 201;
			return classroom;
		},
		{ body: t.Any() },
	)
	.get("/teacher/:id", async ({ params: { id } }) => {
		return ClassroomService.getByTeacher(id);
	})
	.post(
		"/search",
		async ({ body }) => {
			const { departmentId, programId, levelId, name } = body as any;
			return ClassroomService.search({
				departmentId,
				programId,
				levelId,
				name,
			});
		},
		{ body: t.Any() },
	)
	.delete("/:id", async ({ params: { id }, set }) => {
		await ClassroomService.delete(id);
		set.status = 204;
		return null;
	})
	.post(
		"/upload",
		async ({ body, user, set }) => {
			if ((user as any)?.roles !== "Admin") {
				set.status = 403;
				return { success: false, message: "Forbidden" };
			}
			const { file } = body as { file: string };
			return ClassroomService.importFromXLSX(file, (user as any).sub);
		},
		{ body: ClassroomModel.uploadBody },
	)
	.get("/download-template", ({ set }) => {
		const buffer = ClassroomService.generateTemplate();
		set.headers["Content-Type"] =
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
		set.headers["Content-Disposition"] =
			"attachment; filename=classroom_template.xlsx";
		return buffer;
	});