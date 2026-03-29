import { prisma } from "@/libs/prisma";
import { studentInclude } from "./model";
import { importStudentsFromXLSX, generateStudentTemplate } from "@/libs/xlsx";
import { NotFoundError } from "@/libs/errors";

export abstract class StudentService {
	static async getList(skip: number = 0, take: number = 20) {
		const [data, total] = await Promise.all([
			prisma.student.findMany({
				skip,
				take,
				include: studentInclude,
				orderBy: { studentId: "asc" },
			}),
			prisma.student.count(),
		]);
		return { data, total, skip, take };
	}

	static async search(params: {
		q?: string;
		classroomId?: string;
		departmentId?: string;
		programId?: string;
	}) {
		const { q, classroomId, departmentId, programId } = params;
		return prisma.student.findMany({
			where: {
				...(classroomId ? { classroomId } : {}),
				...(departmentId ? { departmentId } : {}),
				...(programId ? { programId } : {}),
				...(q
					? {
							OR: [
								{ studentId: { contains: q, mode: "insensitive" } },
								{
									user: {
										account: {
											firstName: { contains: q, mode: "insensitive" },
										},
									},
								},
								{
									user: {
										account: {
											lastName: { contains: q, mode: "insensitive" },
										},
									},
								},
							],
						}
					: {}),
			},
			include: studentInclude,
			orderBy: { studentId: "asc" },
		});
	}

	static async searchWithParams(params: {
		classroomId?: string;
		q?: string;
		skip?: number;
		take?: number;
		departmentId?: string;
		programId?: string;
	}) {
		const { classroomId, q, skip = 0, take = 20, departmentId, programId } = params;
		const [data, total] = await Promise.all([
			prisma.student.findMany({
				where: {
					...(classroomId ? { classroomId } : {}),
					...(departmentId ? { departmentId } : {}),
					...(programId ? { programId } : {}),
					...(q
						? {
								OR: [
									{ studentId: { contains: q, mode: "insensitive" } },
									{
										user: {
											account: {
												firstName: { contains: q, mode: "insensitive" },
											},
										},
									},
									{
										user: {
											account: {
												lastName: { contains: q, mode: "insensitive" },
											},
										},
									},
								],
							}
						: {}),
				},
				skip,
				take,
				include: studentInclude,
				orderBy: { studentId: "asc" },
			}),
			prisma.student.count({
				where: {
					...(classroomId ? { classroomId } : {}),
				},
			}),
		]);
		return { data, total };
	}

	static async getById(id: string) {
		const student = await prisma.student.findUnique({
			where: { id },
			include: studentInclude,
		});
		if (!student) {
			throw new NotFoundError("Student not found");
		}
		return student;
	}

	static async create(userId: string, data: any) {
		return prisma.student.create({
			data: { ...data, userId },
			include: studentInclude,
		});
	}

	static async update(id: string, data: any) {
		const { account, ...studentData } = data;
		const student = await prisma.student.findUnique({
			where: { id },
			select: { userId: true },
		});
		if (account && student?.userId) {
			await prisma.account.update({
				where: { userId: student.userId },
				data: account,
			});
		}
		return prisma.student.update({
			where: { id },
			data: studentData,
			include: studentInclude,
		});
	}

	static async delete(id: string) {
		await prisma.student.delete({ where: { id } });
	}

	static async getTrophyOverview(id: string) {
		const [goodness, badness] = await Promise.all([
			prisma.goodnessIndividual.aggregate({
				where: { studentId: id },
				_sum: { goodnessScore: true },
				_count: true,
			}),
			prisma.badnessIndividual.aggregate({
				where: { studentId: id },
				_sum: { badnessScore: true },
				_count: true,
			}),
		]);
		return {
			goodnessScore: goodness._sum.goodnessScore ?? 0,
			goodnessCount: goodness._count,
			badnessScore: badness._sum.badnessScore ?? 0,
			badnessCount: badness._count,
			netScore: (goodness._sum.goodnessScore ?? 0) - (badness._sum.badnessScore ?? 0),
		};
	}

	static async getClassroomTeachers(classroomId: string) {
		const assignments = await prisma.teacherOnClassroom.findMany({
			where: { classroomId },
			select: { teacherId: true },
		});
		const teacherIds = assignments.map((a) => a.teacherId);
		return prisma.teacher.findMany({
			where: { id: { in: teacherIds } },
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
	}

	static generateTemplate() {
		return generateStudentTemplate();
	}

	static async importFromXLSX(fileBase64: string, userId: string) {
		const buffer = Buffer.from(fileBase64, "base64");
		return importStudentsFromXLSX(buffer, userId);
	}
}