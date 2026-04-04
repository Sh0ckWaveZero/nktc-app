import { prisma } from "@/libs/prisma";
import { ConflictError } from "@/libs/errors";

export abstract class ActivityCheckInService {
	static async create(data: any) {
		const { teacherId, classroomId, checkInDate, ...rest } = data;
		const existing = await prisma.activityCheckInReport.findFirst({
			where: { teacherId, classroomId, checkInDate: new Date(checkInDate) },
		});
		if (existing) {
			throw new ConflictError("Activity check-in already exists for this date");
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
		const startDate = new Date(date);
		const endDate = new Date(date);
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);

		const teacherUser = await prisma.user.findFirstOrThrow({
			where: { teacher: { id: teacherId } },
			select: {
				id: true,
				username: true,
				account: {
					select: { id: true, title: true, firstName: true, lastName: true, avatar: true },
				},
				teacher: {
					select: { id: true, teacherId: true, jobTitle: true, academicStanding: true, status: true },
				},
			},
		});

		const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
		if (!classroom) return [];

		const reportCheckIn = await prisma.activityCheckInReport.findFirst({
			where: {
				teacherId,
				classroomId,
				checkInDate: { gte: startDate, lte: endDate },
			},
		});

		const studentsInfo = await prisma.user.findMany({
			where: { student: { classroomId } },
			select: {
				id: true,
				username: true,
				student: { select: { id: true, studentId: true, status: true } },
				account: {
					select: { id: true, title: true, firstName: true, lastName: true, avatar: true },
				},
			},
			orderBy: [{ account: { firstName: "asc" } }, { account: { lastName: "asc" } }],
		});

		const students = studentsInfo.map((student) => ({
			...student,
			checkInStatus: reportCheckIn
				? reportCheckIn.present.includes(student.student?.id ?? "")
					? "present"
					: reportCheckIn.absent.includes(student.student?.id ?? "")
						? "absent"
						: "none"
				: "notCheckIn",
			teacher: teacherUser,
		}));

		return [{ ...classroom, reportCheckIn: reportCheckIn ?? null, students }];
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

		const checkIns = await prisma.activityCheckInReport.findMany({
			where: { teacherId, classroomId },
			orderBy: { checkInDate: "asc" },
		});

		const total = checkIns.length;

		return studentsInfo.map((student) => {
			const studentRecordId = student.student?.id;
			const present = checkIns.filter((r) => r.present?.includes(studentRecordId)).length;
			const absent = checkIns.filter((r) => r.absent?.includes(studentRecordId)).length;

			return {
				...student,
				present,
				presentPercent: total > 0 ? (present / total) * 100 : 0,
				absent,
				absentPercent: total > 0 ? (absent / total) * 100 : 0,
				checkInTotal: total,
			};
		});
	}

	static async update(id: string, data: any) {
		const { updateBy, id: _id, teacherId, classroomId, checkInDate, checkInTime,
			createdAt, updatedAt, createdBy, teacherKey, classroomKey, ...rest } = data;
		return prisma.activityCheckInReport.update({
			where: { id },
			data: rest,
		});
	}

	static async delete(id: string) {
		await prisma.activityCheckInReport.delete({ where: { id } });
	}
}