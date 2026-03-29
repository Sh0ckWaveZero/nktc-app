import { Elysia } from "elysia";
import { TeacherService } from "./service";
import { TeacherModel } from "./model";
import { authGuard } from "@/middleware/auth";

export const teachers = new Elysia({ prefix: "/teachers" })
	.use(authGuard)
	.get(
		"/",
		async ({ query }) => {
			return TeacherService.search(query.q);
		},
		{
			query: TeacherModel.searchQuery,
		},
	)
	.post(
		"/",
		async ({ body, set }) => {
			const teacher = await TeacherService.create(body);
			set.status = 201;
			return teacher;
		},
		{ body: TeacherModel.createBody },
	)
	.put(
		"/:id",
		async ({ params: { id }, body }) => {
			return TeacherService.update(id, body);
		},
		{ body: TeacherModel.updateBody },
	)
	.delete("/:id", async ({ params: { id }, set }) => {
		await TeacherService.delete(id);
		set.status = 204;
		return null;
	})
	.put(
		"/:id/profile",
		async ({ params: { id }, body }) => {
			return TeacherService.updateProfile(id, body);
		},
		{ body: TeacherModel.updateBody },
	)
	.put(
		"/:id/classrooms",
		async ({ params: { id }, body }) => {
			const { classrooms } = body as { classrooms: string[] };
			return TeacherService.updateClassrooms(id, classrooms);
		},
		{ body: TeacherModel.classroomsBody },
	)
	.get("/:id/students", async ({ params: { id } }) => {
		return TeacherService.getStudents(id);
	})
	.get("/:id/classrooms-and-students", async ({ params: { id } }) => {
		return TeacherService.getClassroomsWithStudents(id);
	});