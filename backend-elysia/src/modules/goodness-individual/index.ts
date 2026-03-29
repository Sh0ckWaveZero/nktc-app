import { Elysia, t } from "elysia";
import { GoodnessService } from "./service";
import { GoodnessModel } from "./model";
import { authGuard } from "@/middleware/auth";

export const goodnessIndividual = new Elysia({ prefix: "/goodness-individual" })
	.use(authGuard)
	.guard({
		detail: {
			tags: ["Behavior-Monitoring"],
			security: [{ BearerAuth: [] }],
		},
	}, (app) =>
		app
			.get(
				"/:studentId",
				async ({ params: { studentId }, query }) => {
					const skip = Number(query.skip ?? 0);
					const take = Number(query.take ?? 20);
					return GoodnessService.getByStudent(studentId, skip, take);
				},
				{
					query: GoodnessModel.queryBody,
					detail: {
						summary: "Get goodness records by student",
					},
				},
			)
			.post(
				"/",
				async ({ body, set }) => {
					const record = await GoodnessService.create(body);
					set.status = 201;
					return record;
				},
				{
					body: GoodnessModel.goodnessBody,
					detail: {
						summary: "Create a goodness record",
					},
				},
			)
			.post(
				"/group",
				async ({ body, set }) => {
					const records = body as any[];
					const created = await GoodnessService.createMany(records);
					set.status = 201;
					return created;
				},
				{
					body: t.Array(GoodnessModel.goodnessBody),
					detail: {
						summary: "Create multiple goodness records",
					},
				},
			)
			.post(
				"/search",
				async ({ body }) => {
					const { classroomId, studentId, startDate, endDate, skip, take } = body as any;
					return GoodnessService.search({
						classroomId,
						studentId,
						startDate,
						endDate,
						skip: skip ?? 0,
						take: take ?? 50,
					});
				},
				{
					body: t.Any(),
					detail: {
						summary: "Search goodness records",
					},
				},
			)
			.post(
				"/summary",
				async ({ body }) => {
					const { classroomId, startDate, endDate } = body as any;
					return GoodnessService.summary({ classroomId, startDate, endDate });
				},
				{
					body: t.Any(),
					detail: {
						summary: "Get goodness summary",
					},
				},
			)
			.delete("/:id", async ({ params: { id }, set }) => {
				await GoodnessService.delete(id);
				set.status = 204;
				return null;
			}, {
				detail: {
					summary: "Delete a goodness record",
				},
			}),
	);