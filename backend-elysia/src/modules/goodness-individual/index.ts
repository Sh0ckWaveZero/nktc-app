import { Elysia, t } from "elysia";
import { GoodnessService } from "./service";
import { GoodnessModel } from "./model";
import { authGuard } from "@/middleware/auth";

export const goodnessIndividual = new Elysia({ prefix: "/goodness-individual" })
	.use(authGuard)
	.get(
		"/:studentId",
		async ({ params: { studentId }, query }) => {
			const skip = Number(query.skip ?? 0);
			const take = Number(query.take ?? 20);
			return GoodnessService.getByStudent(studentId, skip, take);
		},
		{
			query: GoodnessModel.queryBody,
		},
	)
	.post(
		"/",
		async ({ body, set }) => {
			const record = await GoodnessService.create(body);
			set.status = 201;
			return record;
		},
		{ body: GoodnessModel.goodnessBody },
	)
	.post(
		"/group",
		async ({ body, set }) => {
			const records = body as any[];
			const created = await GoodnessService.createMany(records);
			set.status = 201;
			return created;
		},
		{ body: t.Array(GoodnessModel.goodnessBody) },
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
		{ body: t.Any() },
	)
	.post(
		"/summary",
		async ({ body }) => {
			const { classroomId, startDate, endDate } = body as any;
			return GoodnessService.summary({ classroomId, startDate, endDate });
		},
		{ body: t.Any() },
	)
	.delete("/:id", async ({ params: { id }, set }) => {
		await GoodnessService.delete(id);
		set.status = 204;
		return null;
	});