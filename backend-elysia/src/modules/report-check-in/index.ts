import { Elysia } from "elysia";
import { ReportCheckInService } from "./service";
import { ReportCheckInModel } from "./model";
import { authGuard } from "@/middleware/auth";

export const reportCheckIn = new Elysia({ prefix: "/reportCheckIn" })
	.use(authGuard)
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const record = await ReportCheckInService.create(body);
				set.status = 201;
				return record;
			} catch (error: any) {
				set.status = error.status || 500;
				return { success: false, message: error.message };
			}
		},
		{ body: ReportCheckInModel.checkInBody },
	)
	.get("/teacher/:teacherId/classroom/:classroomId", async ({ params: { teacherId, classroomId } }) => {
		return ReportCheckInService.getByTeacherAndClassroom(teacherId, classroomId);
	})
	.get(
		"/teacher/:teacherId/classroom/:classroomId/start-date/:date/daily-report",
		async ({ params: { teacherId, classroomId, date } }) => {
			return ReportCheckInService.getByDate(teacherId, classroomId, date);
		},
	)
	.get(
		"/start-date/:startDate/end-date/:endDate/admin-daily-report",
		async ({ params: { startDate, endDate } }) => {
			return ReportCheckInService.getByDateRange(startDate, endDate);
		},
	)
	.get(
		"/teacher/:teacherId/classroom/:classroomId/summary-report",
		async ({ params: { teacherId, classroomId } }) => {
			return ReportCheckInService.getSummary(teacherId, classroomId);
		},
	)
	.patch(
		"/:id/daily-report",
		async ({ params: { id }, body }) => {
			return ReportCheckInService.update(id, body);
		},
		{ body: ReportCheckInModel.updateBody },
	)
	.get(
		"/student/:studentId/classroom/:classroomId/start-date/:start/end-date/:end/weekly-report",
		async ({ params: { studentId, classroomId, start, end } }) => {
			return ReportCheckInService.getStudentWeekly(studentId, classroomId, start, end);
		},
	)
	.delete("/:id", async ({ params: { id }, set }) => {
		await ReportCheckInService.delete(id);
		set.status = 200;
		return { success: true, message: "Deleted successfully" };
	});