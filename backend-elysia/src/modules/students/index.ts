import { Elysia, t } from "elysia";
import { StudentService } from "./service";
import { StudentModel } from "./model";
import { authGuard, type JwtPayload } from "@/middleware/auth";
import { UnauthorizedError, ForbiddenError } from "@/libs/errors";
import { prisma } from "@/libs/prisma";
import {
	StudentPlainInputCreate,
	StudentPlainInputUpdate,
} from "../../../generated/prismabox/Student";

function requireAdmin(user: unknown): JwtPayload {
	const payload = user as JwtPayload | null;
	if (!payload) throw new UnauthorizedError();
	if (payload.roles !== "Admin") throw new ForbiddenError();
	return payload;
}

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
					return StudentService.searchWithParams(query);
				},
				{
					query: StudentModel.searchParams,
					detail: {
						summary: "List all students",
					},
				},
			)
			.get(
				"/search",
				async ({ query }) => {
					return StudentService.searchWithParams(query);
				},
				{
					query: StudentModel.searchParams,
					detail: {
						summary: "Search students",
					},
				},
			)
			.post(
				"/search-with-params",
				async ({ body }) => {
					return StudentService.searchWithParams(body);
				},
				{
					body: StudentModel.searchParams,
					detail: {
						summary: "Search students with complex params",
					},
				},
			)
			.get("/check-id", async ({ query }) => {
				const { studentId } = query as { studentId: string };
				const exists = await prisma.student.findFirst({
					where: { studentId },
					select: { id: true },
				});
				return { exists: !!exists };
			}, {
				query: t.Object({ studentId: t.String() }),
				detail: { summary: "Check if studentId is already taken" },
			})
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
					body: StudentModel.createBody,
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
					body: StudentModel.updateBody,
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
			.post(
				"/promote-classroom",
				async ({ body, user }) => {
					const payload = requireAdmin(user);
					const { sourceClassroomId, targetClassroomId } = body as StudentModel["promoteBody"];
					return StudentService.promoteClassroom(sourceClassroomId, targetClassroomId, payload.sub);
				},
				{
					body: StudentModel.promoteBody,
					detail: { summary: "Promote all students from one classroom to another" },
				},
			)
			.post(
				"/graduate-classroom",
				async ({ body, user }) => {
					const payload = requireAdmin(user);
					const { classroomId, graduationYear, graduationDate } = body as StudentModel["graduateClassroomBody"];
					return StudentService.graduateClassroom(classroomId, graduationYear, payload.sub, graduationDate);
				},
				{
					body: StudentModel.graduateClassroomBody,
					detail: { summary: "Graduate all students in a classroom" },
				},
			)
			.delete(
				"/classroom/:id",
				async ({ params: { id }, user }) => {
					const payload = requireAdmin(user);
					return StudentService.deleteAllByClassroom(id, payload.sub);
				},
				{
					detail: { summary: "Delete all students in a classroom" },
				},
			)
			.get(
				"/promote-preview",
				async ({ query, user }) => {
					requireAdmin(user);
					const { sourceClassroomId } = query as { sourceClassroomId: string };
					return StudentService.promotePreview(sourceClassroomId);
				},
				{
					query: t.Object({ sourceClassroomId: t.String() }),
					detail: { summary: "Preview students to be promoted from a classroom" },
				},
			)
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
				async ({ body, user }) => {
					const payload = requireAdmin(user);
					const { file } = body as { file: string };
					const result = await StudentService.importFromXLSX(file, payload.sub);
					const hasErrors = result.failed > 0;
					const created = Math.max(result.success - result.updated, 0);
					const successMessage =
						result.updated > 0
							? `นำเข้าใหม่ ${created} และอัปเดต ${result.updated} รายการ`
							: `นำเข้าข้อมูลนักเรียนสำเร็จ ${result.success} รายการ`;

					return {
						success: true,
						message: hasErrors
							? `${successMessage} จาก ${result.total} รายการ`
							: successMessage,
						total: result.total,
						imported: result.success,
						updated: result.updated,
						failed: result.failed,
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
