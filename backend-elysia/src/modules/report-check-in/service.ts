import { prisma } from "@/libs/prisma";
import { ConflictError } from "@/libs/errors";

export abstract class ReportCheckInService {
	static async create(data: any) {
		const { teacherId, classroomId, checkInDate, ...rest } = data;
		const existing = await prisma.reportCheckIn.findFirst({
			where: { teacherId, classroomId, checkInDate: new Date(checkInDate) },
		});
		if (existing) {
			throw new ConflictError("Check-in already exists for this date");
		}
		return prisma.reportCheckIn.create({
			data: { teacherId, classroomId, checkInDate: new Date(checkInDate), ...rest },
		});
	}

	static async getByTeacherAndClassroom(teacherId: string, classroomId: string) {
		const record = await prisma.reportCheckIn.findFirst({
			where: { teacherId, classroomId },
			orderBy: { checkInDate: "desc" },
		});
		return record ?? {};
	}

	static async getByDate(teacherId: string, classroomId: string, date: string) {
		return prisma.reportCheckIn.findFirst({
			where: { teacherId, classroomId, checkInDate: new Date(date) },
			include: { classroom: true, teacher: true },
		});
	}

	static async getByDateRange(startDate: string, endDate: string) {
		return prisma.reportCheckIn.findMany({
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
		const records = await prisma.reportCheckIn.findMany({
			where: { teacherId, classroomId },
			orderBy: { checkInDate: "asc" },
		});
		return {
			totalDays: records.length,
			totalPresent: records.reduce((s, r) => s + (r.present?.length ?? 0), 0),
			totalAbsent: records.reduce((s, r) => s + (r.absent?.length ?? 0), 0),
			totalLate: records.reduce((s, r) => s + (r.late?.length ?? 0), 0),
			totalLeave: records.reduce((s, r) => s + (r.leave?.length ?? 0), 0),
			totalInternship: records.reduce((s, r) => s + (r.internship?.length ?? 0), 0),
			records,
		};
	}

	static async update(id: string, data: any) {
		return prisma.reportCheckIn.update({
			where: { id },
			data,
		});
	}

	static async getStudentWeekly(
		studentId: string,
		classroomId: string,
		start: string,
		end: string,
	) {
		const records = await prisma.reportCheckIn.findMany({
			where: {
				classroomId,
				checkInDate: { gte: new Date(start), lte: new Date(end) },
			},
			orderBy: { checkInDate: "asc" },
		});
		return records.map((r) => ({
			...r,
			studentStatus: r.present?.includes(studentId)
				? "present"
				: r.absent?.includes(studentId)
					? "absent"
					: r.late?.includes(studentId)
						? "late"
						: r.leave?.includes(studentId)
							? "leave"
							: r.internship?.includes(studentId)
								? "internship"
								: "unknown",
		}));
	}

	static async delete(id: string) {
		await prisma.reportCheckIn.delete({ where: { id } });
	}
}