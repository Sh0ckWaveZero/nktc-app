import { Elysia, t } from "elysia";
import { StudentService } from "./service";
import { StudentModel } from "./model";
import { authGuard } from "@/middleware/auth";
import {
	StudentPlainInputCreate,
	StudentPlainInputUpdate,
} from "../../../generated/prismabox/Student";

export const students = new Elysia({ prefix: "/students" })
	.use(authGuard)
	.get(
		"/list",
		async ({ query }) => {
			const skip = Number(query.skip ?? 0);
			const take = Number(query.take ?? 20);
			return StudentService.getList(skip, take);
		},
		{
			query: StudentModel.listQuery,
		},
	)
	.get(
		"/search",
		async ({ query }) => {
			return StudentService.search(query);
		},
		{
			query: StudentModel.searchQuery,
		},
	)
	.post(
		"/search-with-params",
		async ({ body }) => {
			const { classroomId, q, skip, take, departmentId, programId } = body as any;
			return StudentService.searchWithParams({
				classroomId,
				q,
				skip: skip ?? 0,
				take: take ?? 20,
				departmentId,
				programId,
			});
		},
		{ body: t.Any() },
	)
	.get("/profile/:id", async ({ params: { id }, set }) => {
		try {
			return await StudentService.getById(id);
		} catch (error: any) {
			set.status = error.status || 500;
			return { success: false, message: error.message };
		}
	})
	.post(
		"/profile/:id",
		async ({ params: { id }, body, set }) => {
			const student = await StudentService.create(id, body);
			set.status = 201;
			return student;
		},
		{ body: StudentPlainInputCreate },
	)
	.put(
		"/profile/:id",
		async ({ params: { id }, body }) => {
			return StudentService.update(id, body);
		},
		{ body: StudentPlainInputUpdate },
	)
	.delete("/:id", async ({ params }) => {
		await StudentService.delete(params.id);
		return null;
	})
	.get("/trophy-overview/:id", async ({ params: { id } }) => {
		return StudentService.getTrophyOverview(id);
	})
	.get("/classroom/:id/teacher", async ({ params: { id } }) => {
		return StudentService.getClassroomTeachers(id);
	})
	.get("/download", () => ({
		message: "Use /statics/:folder/:filename to download files",
	}))
	.get("/download-template", ({ set }) => {
		const buffer = StudentService.generateTemplate();
		set.headers["Content-Type"] =
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
		set.headers["Content-Disposition"] =
			"attachment; filename=student_template.xlsx";
		return buffer;
	})
	.post(
		"/upload",
		async ({ body, user, set }) => {
			if ((user as any)?.roles !== "Admin") {
				set.status = 403;
				return { success: false, message: "Forbidden" };
			}
			const { file } = body as { file: string };
			const result = await StudentService.importFromXLSX(file, (user as any).sub);
			return {
				success: true,
				message: `Imported ${result.success} students`,
				errors: result.errors,
			};
		},
		{ body: StudentModel.uploadBody },
	);