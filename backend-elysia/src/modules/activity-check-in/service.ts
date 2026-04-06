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

	static async getByTeacherAndClassroom(teacherId: string, classroomId: string, date?: string) {
		// ถ้ามี date ให้กรองเฉพาะวันนั้น ไม่เช่นนั้นจะส่งข้อมูลวันเก่ากลับมาผิดๆ
		const where = date
			? (() => {
				const start = new Date(date);
				const end = new Date(date);
				start.setHours(0, 0, 0, 0);
				end.setHours(23, 59, 59, 999);
				return { teacherId, classroomId, checkInDate: { gte: start, lte: end } };
			})()
			: { teacherId, classroomId };

		const record = await prisma.activityCheckInReport.findFirst({
			where,
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
		const start = new Date(startDate);
		const end = new Date(endDate);
		start.setHours(0, 0, 0, 0);
		end.setHours(23, 59, 59, 999);

		const classrooms = await prisma.classroom.findMany({
			select: {
				id: true,
				name: true,
				level: {
					select: {
						id: true,
						levelName: true,
						levelFullName: true,
					},
				},
				department: {
					select: {
						id: true,
						departmentId: true,
						name: true,
					},
				},
			},
		});

		const nameNumberRegex = /^([^\d]+)(\d+\/\d+)-(.*)$/;
		const sortedClassrooms = classrooms
			.sort((a, b) => {
				const nameA = a.name ?? "";
				const nameB = b.name ?? "";
				const matchA = nameA.match(nameNumberRegex);
				const matchB = nameB.match(nameNumberRegex);
				if (!matchA || !matchB) return nameA.localeCompare(nameB);
				const prefixA = matchA[1] ?? "";
				const numberA = matchA[2] ?? "";
				const suffixA = matchA[3] ?? "";
				const prefixB = matchB[1] ?? "";
				const numberB = matchB[2] ?? "";
				const suffixB = matchB[3] ?? "";
				if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);
				const [majorA = "0", minorA = "0"] = numberA.split("/");
				const [majorB = "0", minorB = "0"] = numberB.split("/");
				if (majorA !== majorB) return Number(majorA) - Number(majorB);
				if (minorA !== minorB) return Number(minorA) - Number(minorB);
				return suffixA.localeCompare(suffixB);
			})
			.sort((a, b) => (a.department?.name ?? "").localeCompare(b.department?.name ?? ""));

		const totalStudents = await prisma.student.count();

		const checkIn = await Promise.all(
			sortedClassrooms.map(async (classroom) => {
				const report = await prisma.activityCheckInReport.findFirst({
					where: {
						classroomId: classroom.id,
						checkInDate: { gte: start, lte: end },
					},
				});

				const checkInBy = report?.createdBy
					? await prisma.user.findFirst({
						where: { teacher: { id: report.createdBy } },
						select: {
							id: true,
							username: true,
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
					})
					: null;

				const present = report ? report.present.length : 0;
				const absent = report ? report.absent.length : 0;
				const total = present + absent;
				const pct = (n: number) => (total > 0 ? Math.round((n / total) * 10000) / 100 : 0);

				return {
					...classroom,
					present,
					presentPercent: pct(present),
					absent,
					absentPercent: pct(absent),
					total,
					checkInDate: report?.checkInDate ?? null,
					...(checkInBy ? { checkInBy } : {}),
				};
			}),
		);

		return { students: totalStudents, checkIn };
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
			const studentRecordId = student.student?.id ?? "";
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