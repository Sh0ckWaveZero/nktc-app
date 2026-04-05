import { Elysia } from "elysia";
import { ReportCheckInService } from "./service";
import { ReportCheckInModel } from "./model";
import { authGuard } from "@/middleware/auth";

export const reportCheckIn = new Elysia({ prefix: "/reportCheckIn" })
	.use(authGuard)
	.guard({
		detail: {
			tags: ["Attendance"],
			security: [{ BearerAuth: [] }],
		},
	}, (app) =>
		app
			.post(
				"/",
				async ({ body, set }) => {
					const record = await ReportCheckInService.create(body);
					set.status = 201;
					return record;
				},
				{
					body: ReportCheckInModel.checkInBody,
					detail: {
						summary: "Create check-in record",
					},
				},
			)
			.get("/teacher/:teacherId/classroom/:classroomId", async ({ params: { teacherId, classroomId } }) => {
				return ReportCheckInService.getByTeacherAndClassroom(teacherId, classroomId);
			}, {
				detail: {
					summary: "Get check-in by teacher and classroom",
				},
			})
			.get(
				"/teacher/:teacherId/classroom/:classroomId/start-date/:date/daily-report",
				async ({ params: { teacherId, classroomId, date } }) => {
					return ReportCheckInService.getByDate(teacherId, classroomId, date);
				},
				{
					detail: {
						summary: "Get daily report by date",
					},
				},
			)
			.get(
				"/start-date/:startDate/end-date/:endDate/admin-daily-report",
				async ({ params: { startDate, endDate } }) => {
					return ReportCheckInService.getByDateRange(startDate, endDate);
				},
				{
					detail: {
						summary: "Get admin daily report for date range",
					},
				},
			)
			.get(
				"/teacher/:teacherId/classroom/:classroomId/summary-report",
				async ({ params: { teacherId, classroomId } }) => {
					return ReportCheckInService.getSummary(teacherId, classroomId);
				},
				{
					detail: {
						summary: "Get check-in summary",
					},
				},
			)
			.patch(
				"/:id/daily-report",
				async ({ params: { id }, body }) => {
					return ReportCheckInService.update(id, body);
				},
				{
					body: ReportCheckInModel.updateBody,
					detail: {
						summary: "Update daily check-in report",
					},
				},
			)
			.get(
				"/student/:studentId/classroom/:classroomId/start-date/:start/end-date/:end/weekly-report",
				async ({ params: { studentId, classroomId, start, end } }) => {
					return ReportCheckInService.getStudentWeekly(studentId, classroomId, start, end);
				},
				{
					detail: {
						summary: "Get weekly report for a student",
					},
				},
			)
			.delete("/:id", async ({ params: { id }, set }) => {
				await ReportCheckInService.delete(id);
				set.status = 200;
				return { success: true, message: "Deleted successfully" };
			}, {
				detail: {
					summary: "Delete check-in record",
				},
			}),
	);