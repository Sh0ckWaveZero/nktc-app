import { Elysia, t } from "elysia";
import { ForbiddenError } from "@/libs/errors";
import { VisitService } from "./service";
import { authGuard } from "@/middleware/auth";

const teacherVisitQuery = t.Object({
	classroomId: t.Optional(t.String()),
	academicYear: t.Optional(t.String()),
});

const visitWriteBody = t.Object({
	studentKey: t.String(),
	studentId: t.String(),
	classroomId: t.String(),
	visitDate: t.String(),
	images: t.Array(t.String(), { minItems: 3, maxItems: 3 }),
	academicYear: t.Optional(t.String()),
	visitDetail: t.Optional(t.Any()),
	visitMap: t.Optional(t.Nullable(t.String())),
});

export const visits = new Elysia({ prefix: "/visits" })
	.use(authGuard)
	.guard({
		detail: {
			tags: ["Visits"],
			security: [{ BearerAuth: [] }],
		},
	}, (app) =>
			app
				.get(
					"/get-visit/all",
					async ({ query }) => {
						return VisitService.getAll(query);
					},
					{
						query: t.Object({
							classroomId: t.Optional(t.String()),
							academicYear: t.Optional(t.String()),
							visitNo: t.Optional(t.String()),
						}),
						detail: {
							summary: "Get all teacher visits with filters",
						},
					},
				)
				.get(
					"/report/summary",
					async ({ query, user }) => {
						if ((user as any).roles !== "Admin") {
							throw new ForbiddenError("Only admin can access visit reports");
						}

						return VisitService.getAdminVisitSummaryReport(query);
					},
					{
						query: t.Object({
							classroomId: t.Optional(t.String()),
							academicYear: t.Optional(t.String()),
							visitNo: t.Optional(t.String()),
							departmentId: t.Optional(t.String()),
						}),
						detail: {
							summary: "Get admin visit summary report grouped by teacher and visit date",
						},
					},
				)
				.get(
					"/teacher/students",
					async ({ user, query }) => {
						return VisitService.getTeacherStudentVisits((user as any).sub, query);
					},
					{
						query: teacherVisitQuery,
						detail: {
							summary: "Get teacher advisor students with latest visit status",
						},
					},
				)
				.get(
					"/:id",
					async ({ params: { id }, user }) => {
						return VisitService.getById((user as any).sub, id);
					},
					{
						detail: {
							summary: "Get visit detail by ID",
						},
					},
				)
				.post(
					"/",
					async ({ body, user, set }) => {
						const visit = await VisitService.create((user as any).sub, body);
						set.status = 201;
						return visit;
					},
					{
						body: visitWriteBody,
						detail: {
							summary: "Create a visit record",
						},
					},
				)
				.put(
					"/:id",
					async ({ params: { id }, body, user }) => {
						return VisitService.update((user as any).sub, id, body);
					},
					{
						body: visitWriteBody,
						detail: {
							summary: "Update a visit record",
						},
					},
				),
	);