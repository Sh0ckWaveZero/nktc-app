import { prisma } from "@/libs/prisma";
import { ConflictError } from "@/libs/errors";
import { getBangkokDayRange, toStoredCheckInDate } from "@/libs/date";

export abstract class ActivityCheckInService {
	static async create(data: any) {
		const { teacherId, classroomId, checkInDate, activityType, ...rest } = data;
		const actType = activityType ?? "CLUB";
		const { start, end } = getBangkokDayRange(checkInDate);
		const existing = await prisma.activityCheckInReport.findFirst({
			where: {
				teacherId,
				classroomId,
				checkInDate: { gte: start, lte: end },
				activityType: actType,
			},
		});
		if (existing) {
			throw new ConflictError("Activity check-in already exists for this date");
		}
		return prisma.activityCheckInReport.create({
			data: {
				teacherId,
				classroomId,
				checkInDate: toStoredCheckInDate(checkInDate),
				activityType: actType,
				...rest,
			},
		});
	}

	static async getByTeacherAndClassroom(teacherId: string, classroomId: string, date?: string, activityType?: string) {
		// ถ้ามี date ให้กรองเฉพาะวันนั้น ไม่เช่นนั้นจะส่งข้อมูลวันเก่ากลับมาผิดๆ
		const actType = activityType ?? "CLUB";
		const baseWhere: any = { teacherId, classroomId, activityType: actType };

		const where = date
			? (() => {
					const { start, end } = getBangkokDayRange(date);
					return { ...baseWhere, checkInDate: { gte: start, lte: end } };
				})()
			: baseWhere;

		const record = await prisma.activityCheckInReport.findFirst({
			where,
			orderBy: { checkInDate: "desc" },
		});
		return record ?? {};
	}

	static async getByDate(teacherId: string, classroomId: string, date: string, activityType?: string) {
		const { start: startDate, end: endDate } = getBangkokDayRange(date);

		const teacherUser = await prisma.user.findFirstOrThrow({
			where: { teacher: { id: teacherId } },
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
				teacher: {
					select: {
						id: true,
						teacherId: true,
						jobTitle: true,
						academicStanding: true,
						status: true,
					},
				},
			},
		});

		const classroom = await prisma.classroom.findUnique({
			where: { id: classroomId },
		});
		if (!classroom) return [];

		const reportCheckIn = await prisma.activityCheckInReport.findFirst({
			where: {
				teacherId,
				classroomId,
				checkInDate: { gte: startDate, lte: endDate },
				activityType: activityType ?? "CLUB",
			},
		});

		const studentsInfo = await prisma.user.findMany({
			where: { student: { classroomId } },
			select: {
				id: true,
				username: true,
				student: { select: { id: true, studentId: true, status: true } },
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
			orderBy: [{ account: { firstName: "asc" } }, { account: { lastName: "asc" } }],
		});

		const students = studentsInfo.map((student) => ({
			...student,
			checkInStatus: reportCheckIn ? (reportCheckIn.present.includes(student.student?.id ?? "") ? "present" : reportCheckIn.absent.includes(student.student?.id ?? "") ? "absent" : "none") : "notCheckIn",
			teacher: teacherUser,
		}));

		return [{ ...classroom, reportCheckIn: reportCheckIn ?? null, students }];
	}

	static async getByDateRange(startDate: string, endDate: string, activityType?: string) {
		const { start } = getBangkokDayRange(startDate);
		const { end } = getBangkokDayRange(endDate);
		const selectedActivityType = activityType ?? "CLUB";

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
				const records = await prisma.activityCheckInReport.findMany({
					where: {
						classroomId: classroom.id,
						checkInDate: { gte: start, lte: end },
						activityType: selectedActivityType,
					},
					orderBy: { checkInDate: "asc" },
				});

				const latest = records[records.length - 1] ?? null;

				const checkInBy = latest?.createdBy
					? await prisma.user.findFirst({
							where: { teacher: { id: latest.createdBy } },
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

				const present = records.reduce((sum, r) => sum + (r.present?.length ?? 0), 0);
				const absent = records.reduce((sum, r) => sum + (r.absent?.length ?? 0), 0);
				const noteEntries = records.map((record) => ({
					date: record.checkInDate?.toISOString() ?? null,
					note: record.note ?? null,
				}));
				const total = present + absent;
				const pct = (n: number) => (total > 0 ? Math.round((n / total) * 10000) / 100 : 0);

				return {
					...classroom,
					present,
					presentPercent: pct(present),
					absent,
					absentPercent: pct(absent),
					total,
					checkInDate: latest?.checkInDate ?? null,
					note: latest?.note ?? null,
					noteEntries,
					activityType: latest?.activityType ?? selectedActivityType,
					...(checkInBy ? { checkInBy } : {}),
				};
			}),
		);

		return { students: totalStudents, checkIn };
	}

	static async getSummary(teacherId: string, classroomId: string, activityType?: string) {
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
			orderBy: [{ account: { firstName: "asc" } }, { account: { lastName: "asc" } }],
		});

		const checkIns = await prisma.activityCheckInReport.findMany({
			where: { teacherId, classroomId, activityType: activityType ?? "CLUB" },
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
		const { updateBy, id: _id, teacherId, classroomId, checkInDate, checkInTime, createdAt, updatedAt, createdBy, teacherKey, classroomKey, ...rest } = data;
		return prisma.activityCheckInReport.update({
			where: { id },
			data: rest,
		});
	}

	static async delete(id: string) {
		await prisma.activityCheckInReport.delete({ where: { id } });
	}
}
