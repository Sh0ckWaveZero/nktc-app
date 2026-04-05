import { BadRequestError } from "@/libs/errors";
import { prisma } from "@/libs/prisma";

const THAI_TIMEZONE = "Asia/Bangkok";

type DailyAggregate = {
	date: string;
	present: number;
	absent: number;
	late: number;
	leave: number;
	internship: number;
	checkedRecords: number;
	totalStudents: number;
	attendanceRate: number;
};

const thaiDateFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: THAI_TIMEZONE,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

const toDateKey = (value: Date | null | undefined): string => {
	if (!value) {
		return "";
	}

	return thaiDateFormatter.format(value);
};

const toPercent = (value: number, total: number): number => {
	if (total <= 0) {
		return 0;
	}

	return Number(((value / total) * 100).toFixed(2));
};

const parseDateInput = (
	value: string | undefined,
	label: "startDate" | "endDate",
	isEndOfDay = false,
): Date | undefined => {
	if (!value) {
		return undefined;
	}

	const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
	const parsed = dateOnlyPattern.test(value)
		? new Date(
			`${value}T${isEndOfDay ? "23:59:59.999" : "00:00:00.000"}+07:00`,
		)
		: new Date(value);

	if (Number.isNaN(parsed.getTime())) {
		throw new BadRequestError("รูปแบบวันที่ไม่ถูกต้อง", label);
	}

	return parsed;
};

const normalizeNullableLabel = (value: string | null | undefined): string | null => {
	const normalized = value?.trim();
	return normalized ? normalized : null;
};

export abstract class StatisticsService {
	static async getTermStats(params: {
		startDate?: string;
		endDate?: string;
		academicYear?: string;
		departmentId?: string;
		programId?: string;
	}) {
		const { startDate, endDate, departmentId, programId } = params;

		const normalizedDepartmentId =
			departmentId && departmentId !== "all" ? departmentId : undefined;
		const normalizedProgramId =
			programId && programId !== "all" ? programId : undefined;

		const normalizedStartDate = parseDateInput(startDate, "startDate");
		const normalizedEndDate = parseDateInput(endDate, "endDate", true);

		if (
			normalizedStartDate &&
			normalizedEndDate &&
			normalizedStartDate.getTime() > normalizedEndDate.getTime()
		) {
			throw new BadRequestError(
				"วันที่เริ่มต้นต้องน้อยกว่าหรือเท่ากับวันที่สิ้นสุด",
				"startDate",
			);
		}

		const classroomWhere = {
			...(normalizedDepartmentId ? { departmentId: normalizedDepartmentId } : {}),
			...(normalizedProgramId ? { programId: normalizedProgramId } : {}),
		};

		const studentWhere = {
			...(normalizedDepartmentId ? { departmentId: normalizedDepartmentId } : {}),
			...(normalizedProgramId ? { programId: normalizedProgramId } : {}),
		};

		const teacherWhere = {
			...(normalizedDepartmentId ? { departmentId: normalizedDepartmentId } : {}),
			...(normalizedProgramId ? { programId: normalizedProgramId } : {}),
		};

		const reportWhere = {
			...(normalizedStartDate || normalizedEndDate
				? {
					checkInDate: {
						...(normalizedStartDate ? { gte: normalizedStartDate } : {}),
						...(normalizedEndDate ? { lte: normalizedEndDate } : {}),
					},
				}
				: {}),
			...(Object.keys(classroomWhere).length > 0
				? {
					classroom: classroomWhere,
				}
				: {}),
		};

		const [checkIns, totalStudents, teachers, department, program] = await Promise.all([
			prisma.reportCheckIn.findMany({
				where: reportWhere,
				select: {
					id: true,
					teacherId: true,
					teacherKey: true,
					checkInDate: true,
					present: true,
					absent: true,
					late: true,
					leave: true,
					internship: true,
				},
				orderBy: {
					checkInDate: "asc",
				},
			}),
			prisma.student.count({
				where: studentWhere,
			}),
			prisma.teacher.findMany({
				where: teacherWhere,
				select: {
					id: true,
					teacherId: true,
					department: {
						select: {
							name: true,
						},
					},
					program: {
						select: {
							name: true,
						},
					},
					user: {
						select: {
							username: true,
							account: {
								select: {
									title: true,
									firstName: true,
									lastName: true,
								},
							},
						},
					},
				},
			}),
			normalizedDepartmentId
				? prisma.department.findUnique({
					where: { id: normalizedDepartmentId },
					select: { id: true, name: true },
				})
				: Promise.resolve(null),
			normalizedProgramId
				? prisma.program.findUnique({
					where: { id: normalizedProgramId },
					select: { id: true, name: true },
				})
				: Promise.resolve(null),
		]);

		const totals = checkIns.reduce(
			(accumulator, report) => {
				accumulator.present += report.present.length;
				accumulator.absent += report.absent.length;
				accumulator.late += report.late.length;
				accumulator.leave += report.leave.length;
				accumulator.internship += report.internship.length;

				return accumulator;
			},
			{
				present: 0,
				absent: 0,
				late: 0,
				leave: 0,
				internship: 0,
			},
		);

		const checkedRecords =
			totals.present +
			totals.absent +
			totals.late +
			totals.leave +
			totals.internship;

		const studentsCheckedIn = totals.present;
		const studentsNotCheckedIn =
			totals.absent + totals.late + totals.leave + totals.internship;

		const activityMap = new Map<
			string,
			{ count: number; lastCheckInDate: string | null }
		>();

		const dailyMap = new Map<
			string,
			{
				present: number;
				absent: number;
				late: number;
				leave: number;
				internship: number;
			}
		>();

		for (const report of checkIns) {
			const teacherKeys = [report.teacherId, report.teacherKey].filter(
				(value): value is string => Boolean(value),
			);
			const lastCheckInDate = report.checkInDate
				? report.checkInDate.toISOString()
				: null;

			for (const teacherKey of teacherKeys) {
				const current = activityMap.get(teacherKey) ?? {
					count: 0,
					lastCheckInDate: null,
				};

				current.count += 1;

				if (
					lastCheckInDate &&
					(!current.lastCheckInDate ||
						new Date(lastCheckInDate).getTime() >
							new Date(current.lastCheckInDate).getTime())
				) {
					current.lastCheckInDate = lastCheckInDate;
				}

				activityMap.set(teacherKey, current);
			}

			const dateKey = toDateKey(report.checkInDate);

			if (!dateKey) {
				continue;
			}

			const dailyAggregate = dailyMap.get(dateKey) ?? {
				present: 0,
				absent: 0,
				late: 0,
				leave: 0,
				internship: 0,
			};

			dailyAggregate.present += report.present.length;
			dailyAggregate.absent += report.absent.length;
			dailyAggregate.late += report.late.length;
			dailyAggregate.leave += report.leave.length;
			dailyAggregate.internship += report.internship.length;

			dailyMap.set(dateKey, dailyAggregate);
		}

		const activeTeacherIds = new Set<string>();

		for (const teacher of teachers) {
			if (activityMap.has(teacher.id)) {
				activeTeacherIds.add(teacher.id);
			}
		}

		const teacherActivityDetails = teachers
			.map((teacher) => {
				const activity =
					activityMap.get(teacher.id) ??
					(teacher.teacherId ? activityMap.get(teacher.teacherId) : undefined) ??
					{
						count: 0,
						lastCheckInDate: null,
					};

				const title = normalizeNullableLabel(teacher.user?.account?.title);
				const firstName = normalizeNullableLabel(
					teacher.user?.account?.firstName,
				);
				const lastName = normalizeNullableLabel(teacher.user?.account?.lastName);
				const teacherName =
					[title, firstName, lastName].filter(Boolean).join("") ||
					teacher.user?.username ||
					teacher.teacherId ||
					"-";

				return {
					teacherDbId: teacher.id,
					teacherId: teacher.teacherId ?? teacher.user?.username ?? "-",
					teacherName,
					department: normalizeNullableLabel(teacher.department?.name),
					program: normalizeNullableLabel(teacher.program?.name),
					checkInCount: activity.count,
					lastCheckInDate: activity.lastCheckInDate,
					isActive: activity.count > 0,
				};
			})
			.sort((left, right) => {
				if (left.isActive !== right.isActive) {
					return left.isActive ? -1 : 1;
				}

				if (left.checkInCount !== right.checkInCount) {
					return right.checkInCount - left.checkInCount;
				}

				return left.teacherName.localeCompare(right.teacherName, "th");
			});

		const dailyBreakdown: DailyAggregate[] = Array.from(dailyMap.entries())
			.map(([date, aggregate]) => {
				const dailyCheckedRecords =
					aggregate.present +
					aggregate.absent +
					aggregate.late +
					aggregate.leave +
					aggregate.internship;

				return {
					date,
					present: aggregate.present,
					absent: aggregate.absent,
					late: aggregate.late,
					leave: aggregate.leave,
					internship: aggregate.internship,
					checkedRecords: dailyCheckedRecords,
					totalStudents,
					attendanceRate: toPercent(aggregate.present, dailyCheckedRecords),
				};
			})
			.sort((left, right) => left.date.localeCompare(right.date));

		const activeTeachers = teacherActivityDetails.filter(
			(teacher) => teacher.isActive,
		).length;
		const inactiveTeachers = Math.max(teachers.length - activeTeachers, 0);

		return {
			summary: {
				dateRange: {
					startDate: startDate ?? "",
					endDate: endDate ?? "",
				},
				scope: {
					totalStudents,
					totalTeachers: teachers.length,
					...(normalizedDepartmentId
						? {
							departmentId: normalizedDepartmentId,
							departmentName: department?.name ?? null,
						}
						: {}),
					...(normalizedProgramId
						? {
							programId: normalizedProgramId,
							programName: program?.name ?? null,
						}
						: {}),
				},
			},
			studentCheckInStats: {
				totalStudents,
				totalCheckInDays: dailyBreakdown.length,
				checkedRecords,
				studentsCheckedIn,
				studentsNotCheckedIn,
				averageAttendanceRate: toPercent(studentsCheckedIn, checkedRecords),
				checkInPercentage: toPercent(studentsCheckedIn, checkedRecords),
				notCheckedInPercentage: toPercent(studentsNotCheckedIn, checkedRecords),
				totals,
			},
			teacherUsageStats: {
				totalTeachers: teachers.length,
				activeTeachers,
				inactiveTeachers,
				activePercentage: toPercent(activeTeachers, teachers.length),
				inactivePercentage: toPercent(inactiveTeachers, teachers.length),
				teacherActivityDetails,
			},
			dailyChartData: dailyBreakdown.map((day) => ({
				date: day.date,
				attendanceRate: day.attendanceRate,
				checkedRecords: day.checkedRecords,
				present: day.present,
				absent: day.absent,
				late: day.late,
				leave: day.leave,
				internship: day.internship,
			})),
			dailyBreakdown,
		};
	}
}
