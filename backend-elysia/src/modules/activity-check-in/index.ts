import { Elysia } from "elysia";
import { ActivityCheckInService } from "./service";
import { ActivityCheckInModel } from "./model";
import { authGuard } from "@/middleware/auth";

export const activityCheckIn = new Elysia({ prefix: "/activity-check-in" })
	.use(authGuard)
	.post(
		"/",
		async ({ body, set }) => {
			const record = await ActivityCheckInService.create(body);
			set.status = 201;
			return record;
		},
		{ body: ActivityCheckInModel.activityBody },
	)
	.get(
		"/teacher/:teacherId/classroom/:classroomId",
		async ({ params: { teacherId, classroomId } }) => {
			return ActivityCheckInService.getByTeacherAndClassroom(teacherId, classroomId);
		},
	)
	.get(
		"/teacher/:teacherId/classroom/:classroomId/start-date/:date/daily-report",
		async ({ params: { teacherId, classroomId, date } }) => {
			return ActivityCheckInService.getByDate(teacherId, classroomId, date);
		},
	)
	.get(
		"/start-date/:startDate/end-date/:endDate/admin-daily-report",
		async ({ params: { startDate, endDate } }) => {
			return ActivityCheckInService.getByDateRange(startDate, endDate);
		},
	)
	.get(
		"/teacher/:teacherId/classroom/:classroomId/summary-report",
		async ({ params: { teacherId, classroomId } }) => {
			return ActivityCheckInService.getSummary(teacherId, classroomId);
		},
	)
	.patch(
		"/:id/daily-report",
		async ({ params: { id }, body }) => {
			return ActivityCheckInService.update(id, body);
		},
		{ body: ActivityCheckInModel.updateBody },
	)
	.delete("/:id", async ({ params: { id }, set }) => {
		await ActivityCheckInService.delete(id);
		set.status = 200;
		return { success: true, message: "Deleted successfully" };
	});