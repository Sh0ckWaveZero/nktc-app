import { prisma } from "@/libs/prisma";

export abstract class StatisticsService {
	static async getTermStats(params: {
		startDate?: string;
		endDate?: string;
		academicYear?: string;
		departmentId?: string;
		programId?: string;
	}) {
		const { startDate, endDate, departmentId, programId } = params;

		const dateFilter: any = {
			...(startDate ? { gte: new Date(startDate) } : {}),
			...(endDate ? { lte: new Date(endDate) } : {}),
		};

		const classroomWhere: any = {
			...(departmentId ? { departmentId } : {}),
			...(programId ? { programId } : {}),
		};

		const [checkIns, students, teachers] = await Promise.all([
			prisma.reportCheckIn.findMany({
				where: {
					...(Object.keys(dateFilter).length
						? { checkInDate: dateFilter }
						: {}),
					classroom:
						Object.keys(classroomWhere).length
							? classroomWhere
							: undefined,
				},
				select: {
					present: true,
					absent: true,
					late: true,
					leave: true,
					internship: true,
					checkInDate: true,
					classroomId: true,
				},
			}),
			prisma.student.count({
				where: {
					classroom:
						Object.keys(classroomWhere).length
							? classroomWhere
							: undefined,
				},
			}),
			prisma.teacher.findMany({
				where: programId ? { programId } : undefined,
				select: { id: true, teacherId: true },
				distinct: ["id"],
			}),
		]);

		const totalPresent = checkIns.reduce(
			(s, r) => s + (r.present?.length ?? 0),
			0,
		);
		const totalAbsent = checkIns.reduce(
			(s, r) => s + (r.absent?.length ?? 0),
			0,
		);
		const totalLate = checkIns.reduce(
			(s, r) => s + (r.late?.length ?? 0),
			0,
		);
		const totalLeave = checkIns.reduce(
			(s, r) => s + (r.leave?.length ?? 0),
			0,
		);
		const totalInternship = checkIns.reduce(
			(s, r) => s + (r.internship?.length ?? 0),
			0,
		);
		const totalRecords =
			totalPresent +
			totalAbsent +
			totalLate +
			totalLeave +
			totalInternship;

		const teacherIds = new Set(checkIns.map((r) => r.classroomId));

		return {
			studentCheckInStats: {
				totalStudents: students,
				checkedIn: totalPresent,
				percentage:
					totalRecords > 0
						? Math.round((totalPresent / totalRecords) * 100)
						: 0,
				avgAttendance:
					checkIns.length > 0
						? Math.round(totalPresent / checkIns.length)
						: 0,
			},
			teacherUsageStats: {
				activeTeachers: teacherIds.size,
				totalTeachers: teachers.length,
			},
			dailyBreakdown: {
				present: totalPresent,
				absent: totalAbsent,
				late: totalLate,
				leave: totalLeave,
				internship: totalInternship,
			},
		};
	}
}