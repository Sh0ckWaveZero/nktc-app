import { prisma } from "@/libs/prisma";
import { teacherInclude } from "./model";
import { hash } from "bcrypt";
import { ConflictError } from "@/libs/errors";

export abstract class TeacherService {
	static async search(q?: string) {
		console.log("[TeacherService.search] Query:", q);
		const result = await prisma.teacher.findMany({
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
		console.log("[TeacherService.search] Result count:", result.length);
		return result;
	}

	static async create(data: any) {
		console.log("[TeacherService.create] Input data:", JSON.stringify(data, null, 2));
		
		const { user, teacher } = data;
		console.log("[TeacherService.create] User:", user);
		console.log("[TeacherService.create] Teacher:", teacher);
		
		const hashedPassword = await hash(teacher.password || "password123", 12);
		console.log("[TeacherService.create] Password hashed");
		
		// Handle status - convert "true"/"false" string to "Active"/"Inactive"
		let status = teacher.status || "Active";
		if (status === "true") status = "Active";
		if (status === "false") status = "Inactive";
		console.log("[TeacherService.create] Status:", status);

		try {
			const existingUser = await prisma.user.findUnique({
				where: { username: teacher.username },
			});
			if (existingUser) {
				throw new ConflictError("Username already exists", "username");
			}

			const result = await prisma.user.create({
				data: {
					username: teacher.username,
					password: hashedPassword,
					email: teacher.email || null,
					role: teacher.role || "Teacher",
					status: status,
					createdBy: user?.id || "system",
					updatedBy: user?.id || "system",
					account: {
						create: {
							title: teacher.title || null,
							firstName: teacher.firstName || "",
							lastName: teacher.lastName || "",
							idCard: teacher.idCard || null,
							birthDate: teacher.birthDate ? new Date(teacher.birthDate) : null,
							createdBy: user?.id || "system",
							updatedBy: user?.id || "system",
						},
					},
					teacher: {
						create: {
							jobTitle: teacher.jobTitle || null,
							academicStanding: teacher.academicStanding || null,
							status: status,
							createdBy: user?.id || "system",
							updatedBy: user?.id || "system",
						},
					},
				},
				include: {
					account: true,
					teacher: true,
				},
			});
			console.log("[TeacherService.create] Success - Created user:", result.id);
			return result;
		} catch (error) {
			throw error;
		}
	}

	static async update(id: string, data: any) {
		console.log("[TeacherService.update] ID:", id, "Data:", JSON.stringify(data, null, 2));
		try {
			const { user, teacher, account } = data;
			
			if (teacher && account?.id) {
				await prisma.account.update({
					where: { id: account.id },
					data: {
						firstName: teacher.firstName,
						lastName: teacher.lastName,
						title: teacher.title,
						idCard: teacher.idCard || null,
						birthDate: teacher.birthDate || null,
						updatedBy: user?.id,
					},
				});
				console.log("[TeacherService.update] Account updated:", account.id);
			}

			const result = await prisma.teacher.update({
				where: { id },
				data: {
					jobTitle: teacher?.jobTitle,
					status: teacher?.status,
				},
				include: teacherInclude,
			});
			console.log("[TeacherService.update] Success:", id);
			return result;
		} catch (error) {
			throw error;
		}
	}

	static async delete(id: string) {
		console.log("[TeacherService.delete] ID:", id);
		try {
			const user = await prisma.teacher.findUnique({
				where: { id },
				select: { userId: true },
			});
			if (user?.userId) {
				await prisma.user.delete({ where: { id: user.userId } });
				console.log("[TeacherService.delete] Success - Deleted user:", user.userId);
			} else {
				await prisma.teacher.delete({ where: { id } });
				console.log("[TeacherService.delete] Success - Deleted teacher:", id);
			}
		} catch (error) {
			throw error;
		}
	}

	static async updateProfile(id: string, data: any) {
		console.log("[TeacherService.updateProfile] ID:", id, "Data:", JSON.stringify(data, null, 2));
		try {
			const teacher = await prisma.teacher.findUnique({
				where: { id },
				select: { userId: true },
			});
			if (teacher?.userId) {
				await prisma.account.update({
					where: { userId: teacher.userId },
					data,
				});
				console.log("[TeacherService.updateProfile] Account updated for userId:", teacher.userId);
			}
			const result = await prisma.teacher.findUnique({ where: { id }, include: teacherInclude });
			console.log("[TeacherService.updateProfile] Success:", id);
			return result;
		} catch (error) {
			throw error;
		}
	}

	static async updateClassrooms(id: string, classrooms: string[]) {
		console.log("[TeacherService.updateClassrooms] ID:", id, "Classrooms:", classrooms);
		try {
			await prisma.teacherOnClassroom.deleteMany({ where: { teacherId: id } });
			console.log("[TeacherService.updateClassrooms] Cleared old assignments");
			if (classrooms?.length) {
				await prisma.teacherOnClassroom.createMany({
					data: classrooms.map((classroomId) => ({
						teacherId: id,
						classroomId,
					})),
				});
			}
			const result = await prisma.teacher.findUnique({ where: { id }, include: teacherInclude });
			console.log("[TeacherService.updateClassrooms] Success - Added", classrooms?.length || 0, "classrooms");
			return result;
		} catch (error) {
			throw error;
		}
	}

	static async getStudents(teacherId: string) {
		console.log("[TeacherService.getStudents] TeacherID:", teacherId);
		try {
			const assignments = await prisma.teacherOnClassroom.findMany({
				where: { teacherId },
				select: { classroomId: true },
			});
			const classroomIds = assignments.map((a) => a.classroomId);
			console.log("[TeacherService.getStudents] Classroom IDs:", classroomIds);
			const result = await prisma.student.findMany({
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
			console.log("[TeacherService.getStudents] Result count:", result.length);
			return result;
		} catch (error) {
			throw error;
		}
	}

	static async getClassroomsWithStudents(teacherId: string) {
		console.log("[TeacherService.getClassroomsWithStudents] TeacherID:", teacherId);
		try {
			const assignments = await prisma.teacherOnClassroom.findMany({
				where: { teacherId },
				select: { classroomId: true },
			});
			const classroomIds = assignments.map((a) => a.classroomId);
			console.log("[TeacherService.getClassroomsWithStudents] Classroom IDs:", classroomIds);
			
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
			const result = classrooms.map((c) => ({
				...c,
				students: students.filter((s) => s.classroomId === c.id),
			}));
			console.log("[TeacherService.getClassroomsWithStudents] Result - Classrooms:", classrooms.length, "Students:", students.length);
			return result;
		} catch (error) {
			throw error;
		}
	}
}