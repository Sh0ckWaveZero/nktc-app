import { prisma } from "@/libs/prisma";

export abstract class ActivityCheckInService {
	static async create(data: any) {
		const { teacherId, classroomId, checkInDate, ...rest } = data;
		const existing = await prisma.activityCheckInReport.findFirst({
			where: { teacherId, classroomId, checkInDate: new Date(checkInDate) },
		});
		if (existing) {
			throw { status: 409, message: "Activity check-in already exists for this date" };
		}
		return prisma.activityCheckInReport.create({
			data: { teacherId, classroomId, checkInDate: new Date(checkInDate), ...rest },
		});
	}

	static async getByTeacherAndClassroom(teacherId: string, classroomId: string) {
		const record = await prisma.activityCheckInReport.findFirst({
			where: { teacherId, classroomId },
			orderBy: { checkInDate: "desc" },
		});
		return record ?? {};
	}

	static async getByDate(teacherId: string, classroomId: string, date: string) {
		return prisma.activityCheckInReport.findFirst({
			where: { teacherId, classroomId, checkInDate: new Date(date) },
			include: { classroom: true, teacher: true },
		});
	}

	static async getByDateRange(startDate: string, endDate: string) {
		return prisma.activityCheckInReport.findMany({
			where: {
				checkInDate: { gte: new Date(startDate), lte: new Date(endDate) },
			},
			include: {
				classroom: { include: { program: true, department: true } },
				teacher: true,
			},
			orderBy: { checkInDate: "asc" },
		});
	}

	static async getSummary(teacherId: string, classroomId: string) {
		const records = await prisma.activityCheckInReport.findMany({
			where: { teacherId, classroomId },
			orderBy: { checkInDate: "asc" },
		});
		return {
			totalDays: records.length,
			totalPresent: records.reduce((s, r) => s + (r.present?.length ?? 0), 0),
			totalAbsent: records.reduce((s, r) => s + (r.absent?.length ?? 0), 0),
			records,
		};
	}

	static async update(id: string, data: any) {
		return prisma.activityCheckInReport.update({
			where: { id },
			data,
		});
	}

	static async delete(id: string) {
		await prisma.activityCheckInReport.delete({ where: { id } });
	}
}