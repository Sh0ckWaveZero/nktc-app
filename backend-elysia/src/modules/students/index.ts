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
	.guard({
		detail: {
			tags: ["Students"],
			security: [{ BearerAuth: [] }],
		},
	}, (app) =>
		app
			.get(
				"/list",
				async ({ query }) => {
					const skip = Number(query.skip ?? 0);
					const take = Number(query.take ?? 20);
					return StudentService.getList(skip, take);
				},
				{
					query: StudentModel.listQuery,
					detail: {
						summary: "List all students",
					},
				},
			)
			.get(
				"/search",
				async ({ query }) => {
					return StudentService.search(query);
				},
				{
					query: StudentModel.searchQuery,
					detail: {
						summary: "Search students",
					},
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
				{
					body: t.Any(),
					detail: {
						summary: "Search students with complex params",
					},
				},
			)
			.get("/profile/:id", async ({ params: { id } }) => {
				return StudentService.getById(id);
			}, {
				detail: {
					summary: "Get student profile by ID",
				},
			})
			.post(
				"/profile/:id",
				async ({ params: { id }, body, set }) => {
					const student = await StudentService.create(id, body);
					set.status = 201;
					return student;
				},
				{
					body: StudentPlainInputCreate,
					detail: {
						summary: "Create student profile",
					},
				},
			)
			.put(
				"/profile/:id",
				async ({ params: { id }, body }) => {
					return StudentService.update(id, body);
				},
				{
					body: StudentPlainInputUpdate,
					detail: {
						summary: "Update student profile",
					},
				},
			)
			.delete("/:id", async ({ params }) => {
				await StudentService.delete(params.id);
				return null;
			}, {
				detail: {
					summary: "Delete student profile",
				},
			})
			.get("/trophy-overview/:id", async ({ params: { id } }) => {
				return StudentService.getTrophyOverview(id);
			}, {
				detail: {
					summary: "Get student trophy overview",
				},
			})
			.get("/classroom/:id/teacher", async ({ params: { id } }) => {
				return StudentService.getClassroomTeachers(id);
			}, {
				detail: {
					summary: "Get teachers for a student's classroom",
				},
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
			}, {
				detail: {
					summary: "Download student upload template",
				},
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
				{
					body: StudentModel.uploadBody,
					detail: {
						summary: "Upload student batch via XLSX",
					},
				},
			),
	);