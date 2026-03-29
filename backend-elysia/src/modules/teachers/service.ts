import { prisma } from "@/libs/prisma";
import { teacherInclude } from "./model";

export abstract class TeacherService {
	static async search(q?: string) {
		return prisma.teacher.findMany({
			where: q
				? {
						OR: [
							{ teacherId: { contains: q, mode: "insensitive" } },
							{
								user: {
									account: { firstName: { contains: q, mode: "insensitive" } },
								},
							},
							{
								user: {
									account: { lastName: { contains: q, mode: "insensitive" } },
								},
							},
						],
					}
				: undefined,
			include: teacherInclude,
		});
	}

	static async create(data: any) {
		return prisma.teacher.create({
			data,
			include: teacherInclude,
		});
	}

	static async update(id: string, data: any) {
		return prisma.teacher.update({
			where: { id },
			data,
			include: teacherInclude,
		});
	}

	static async delete(id: string) {
		await prisma.teacher.delete({ where: { id } });
	}

	static async updateProfile(id: string, data: any) {
		const teacher = await prisma.teacher.findUnique({
			where: { id },
			select: { userId: true },
		});
		if (teacher?.userId) {
			await prisma.account.update({
				where: { userId: teacher.userId },
				data,
			});
		}
		return prisma.teacher.findUnique({ where: { id }, include: teacherInclude });
	}

	static async updateClassrooms(id: string, classrooms: string[]) {
		await prisma.teacherOnClassroom.deleteMany({ where: { teacherId: id } });
		if (classrooms?.length) {
			await prisma.teacherOnClassroom.createMany({
				data: classrooms.map((classroomId) => ({
					teacherId: id,
					classroomId,
				})),
			});
		}
		return prisma.teacher.findUnique({ where: { id }, include: teacherInclude });
	}

	static async getStudents(teacherId: string) {
		const assignments = await prisma.teacherOnClassroom.findMany({
			where: { teacherId },
			select: { classroomId: true },
		});
		const classroomIds = assignments.map((a) => a.classroomId);
		return prisma.student.findMany({
			where: { classroomId: { in: classroomIds } },
			include: {
				user: {
					include: {
						account: {
							select: { title: true, firstName: true, lastName: true, avatar: true },
						},
					},
				},
				classroom: true,
				program: true,
				level: true,
			},
		});
	}

	static async getClassroomsWithStudents(teacherId: string) {
		const assignments = await prisma.teacherOnClassroom.findMany({
			where: { teacherId },
			select: { classroomId: true },
		});
		const classroomIds = assignments.map((a) => a.classroomId);
		const classrooms = await prisma.classroom.findMany({
			where: { id: { in: classroomIds } },
			include: {
				program: true,
				department: true,
				level: true,
			},
		});
		const students = await prisma.student.findMany({
			where: { classroomId: { in: classroomIds } },
			include: {
				user: {
					include: {
						account: {
							select: { title: true, firstName: true, lastName: true, avatar: true },
						},
					},
				},
			},
		});
		return classrooms.map((c) => ({
			...c,
			students: students.filter((s) => s.classroomId === c.id),
		}));
	}
}