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
		const studentsInfo = await prisma.user.findMany({
			where: { student: { classroomId } },
			select: {
				id: true,
				username: true,
				student: { select: { id: true, studentId: true } },
				account: {
					select: {
						id: true,
						title: true,
						firstName: true,
						lastName: true,
						avatar: true,
					},
				},
			},
			orderBy: [
				{ account: { firstName: "asc" } },
				{ account: { lastName: "asc" } },
			],
		});

		const checkIns = await prisma.reportCheckIn.findMany({
			where: { teacherId, classroomId },
			orderBy: { checkInDate: "asc" },
		});

		const total = checkIns.length;

		return studentsInfo.map((student) => {
			const studentRecordId = student.student?.id;
			const present = checkIns.filter((r) => r.present?.includes(studentRecordId)).length;
			const absent = checkIns.filter((r) => r.absent?.includes(studentRecordId)).length;
			const late = checkIns.filter((r) => r.late?.includes(studentRecordId)).length;
			const leave = checkIns.filter((r) => r.leave?.includes(studentRecordId)).length;
			const internship = checkIns.filter((r) => r.internship?.includes(studentRecordId)).length;

			return {
				...student,
				present,
				presentPercent: total > 0 ? (present / total) * 100 : 0,
				absent,
				absentPercent: total > 0 ? (absent / total) * 100 : 0,
				late,
				latePercent: total > 0 ? (late / total) * 100 : 0,
				leave,
				leavePercent: total > 0 ? (leave / total) * 100 : 0,
				internship,
				internshipPercent: total > 0 ? (internship / total) * 100 : 0,
				checkInTotal: total,
			};
		});
	}

	static async update(id: string, data: any) {
		const { updateBy, id: _id, teacherId, classroomId, checkInDate, checkInTime,
			createdAt, updatedAt, createdBy, ...rest } = data;
		return prisma.reportCheckIn.update({
			where: { id },
			data: rest,
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