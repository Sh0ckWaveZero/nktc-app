import { Elysia, t } from "elysia";
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
				async ({ params: { teacherId, classroomId }, query }) => {
					return ActivityCheckInService.getByTeacherAndClassroom(teacherId, classroomId, query.date, query.activityType);
				},
				{
					query: ActivityCheckInModel.teacherClassroomQuery,
					detail: {
						summary: "Get activity check-in by teacher and classroom (filter by ?date=YYYY-MM-DD&activityType=CLUB)",
					},
				},
			)
			.get(
				"/teacher/:teacherId/classroom/:classroomId/start-date/:date/daily-report",
				async ({ params: { teacherId, classroomId, date }, query }) => {
					return ActivityCheckInService.getByDate(teacherId, classroomId, date, query?.activityType);
				},
				{
					query: t.Object({
						activityType: t.Optional(t.String()),
					}),
					detail: {
						summary: "Get daily activity report by date (filter by ?activityType=CLUB)",
					},
				},
			)
			.get(
				"/start-date/:startDate/end-date/:endDate/admin-daily-report",
				async ({ params: { startDate, endDate }, query }) => {
					return ActivityCheckInService.getByDateRange(startDate, endDate, query?.activityType);
				},
				{
					query: t.Object({
						activityType: t.Optional(t.String()),
					}),
					detail: {
						summary: "Get admin daily report for date range (filter by ?activityType=CLUB)",
					},
				},
			)
			.get(
				"/teacher/:teacherId/classroom/:classroomId/summary-report",
				async ({ params: { teacherId, classroomId }, query }) => {
					return ActivityCheckInService.getSummary(teacherId, classroomId, query?.activityType);
				},
				{
					query: t.Object({
						activityType: t.Optional(t.String()),
					}),
					detail: {
						summary: "Get activity check-in summary (filter by ?activityType=CLUB)",
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