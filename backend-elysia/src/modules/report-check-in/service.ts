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
				const records = await prisma.reportCheckIn.findMany({
					where: {
						classroomId: classroom.id,
						checkInDate: { gte: start, lte: end },
					},
					orderBy: { checkInDate: "desc" },
				});

				const latest = records[0] ?? null;

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

				// Aggregate unique student IDs across all records in the range
				const presentIds = new Set(records.flatMap((r) => r.present ?? []));
				const absentIds = new Set(records.flatMap((r) => r.absent ?? []));
				const lateIds = new Set(records.flatMap((r) => r.late ?? []));
				const leaveIds = new Set(records.flatMap((r) => r.leave ?? []));
				const internshipIds = new Set(records.flatMap((r) => r.internship ?? []));

				const presentCount = presentIds.size;
				const absentCount = absentIds.size;
				const lateCount = lateIds.size;
				const leaveCount = leaveIds.size;
				const internshipCount = internshipIds.size;
				const total = presentCount + absentCount + lateCount + leaveCount + internshipCount;

				const pct = (n: number) => (total > 0 ? Math.round((n / total) * 10000) / 100 : 0);

				return {
					...classroom,
					present: presentCount,
					presentPercent: pct(presentCount),
					absent: absentCount,
					absentPercent: pct(absentCount),
					late: lateCount,
					latePercent: pct(lateCount),
					leave: leaveCount,
					leavePercent: pct(leaveCount),
					internship: internshipCount,
					internshipPercent: pct(internshipCount),
					total,
					checkInDate: latest?.checkInDate ?? null,
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

		const checkIns = await prisma.reportCheckIn.findMany({
			where: { teacherId, classroomId },
			orderBy: { checkInDate: "asc" },
		});

		const total = checkIns.length;

		return studentsInfo.map((student) => {
			const studentRecordId = student.student?.id ?? "";
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