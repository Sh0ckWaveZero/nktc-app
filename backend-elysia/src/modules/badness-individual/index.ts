import { Elysia, t } from "elysia";
import { BadnessService } from "./service";
import { BadnessModel } from "./model";
import { authGuard } from "@/middleware/auth";

export const badnessIndividual = new Elysia({ prefix: "/badness-individual" })
	.use(authGuard)
	.get(
		"/:studentId",
		async ({ params: { studentId }, query }) => {
			const skip = Number(query.skip ?? 0);
			const take = Number(query.take ?? 20);
			return BadnessService.getByStudent(studentId, skip, take);
		},
		{
			query: BadnessModel.queryBody,
		},
	)
	.post(
		"/",
		async ({ body, set }) => {
			const record = await BadnessService.create(body);
			set.status = 201;
			return record;
		},
		{ body: BadnessModel.badnessBody },
	)
	.post(
		"/group",
		async ({ body, set }) => {
			const records = body as any[];
			const created = await BadnessService.createMany(records);
			set.status = 201;
			return created;
		},
		{ body: t.Array(BadnessModel.badnessBody) },
	)
	.post(
		"/search",
		async ({ body }) => {
			const { classroomId, studentId, startDate, endDate, skip, take } = body as any;
			return BadnessService.search({
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
			return BadnessService.summary({ classroomId, startDate, endDate });
		},
		{ body: t.Any() },
	)
	.delete("/:id", async ({ params: { id }, set }) => {
		await BadnessService.delete(id);
		set.status = 204;
		return null;
	});