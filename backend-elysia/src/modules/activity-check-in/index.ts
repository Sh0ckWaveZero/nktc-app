import { Elysia } from "elysia";
import { ActivityCheckInService } from "./service";
import { ActivityCheckInModel } from "./model";
import { authGuard } from "@/middleware/auth";

export const activityCheckIn = new Elysia({ prefix: "/activity-check-in" })
	.use(authGuard)
	.guard({
		detail: {
			tags: ["Activity-Check-In"],
			security: [{ BearerAuth: [] }],
		},
	}, (app) =>
		app
			.post(
				"/",
				async ({ body, set }) => {
					const record = await ActivityCheckInService.create(body);
					set.status = 201;
					return record;
				},
				{
					body: ActivityCheckInModel.activityBody,
					detail: {
						summary: "Create activity check-in record",
					},
				},
			)
			.get(
				"/teacher/:teacherId/classroom/:classroomId",
				async ({ params: { teacherId, classroomId } }) => {
					return ActivityCheckInService.getByTeacherAndClassroom(teacherId, classroomId);
				},
				{
					detail: {
						summary: "Get activity check-in by teacher and classroom",
					},
				},
			)
			.get(
				"/teacher/:teacherId/classroom/:classroomId/start-date/:date/daily-report",
				async ({ params: { teacherId, classroomId, date } }) => {
					return ActivityCheckInService.getByDate(teacherId, classroomId, date);
				},
				{
					detail: {
						summary: "Get daily activity report by date",
					},
				},
			)
			.get(
				"/start-date/:startDate/end-date/:endDate/admin-daily-report",
				async ({ params: { startDate, endDate } }) => {
					return ActivityCheckInService.getByDateRange(startDate, endDate);
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
					return ActivityCheckInService.getSummary(teacherId, classroomId);
				},
				{
					detail: {
						summary: "Get activity check-in summary",
					},
				},
			)
			.patch(
				"/:id/daily-report",
				async ({ params: { id }, body }) => {
					return ActivityCheckInService.update(id, body);
				},
				{
					body: ActivityCheckInModel.updateBody,
					detail: {
						summary: "Update activity daily report",
					},
				},
			)
			.delete("/:id", async ({ params: { id }, set }) => {
				await ActivityCheckInService.delete(id);
				set.status = 200;
				return { success: true, message: "Deleted successfully" };
			}, {
				detail: {
					summary: "Delete activity check-in record",
				},
			}),
	);