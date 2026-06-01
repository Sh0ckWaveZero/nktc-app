import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockClassroomFindMany = mock();
const mockDepartmentFindUnique = mock();
const mockProgramFindUnique = mock();
const mockReportCheckInFindMany = mock();
const mockStudentCount = mock();
const mockTeacherFindMany = mock();

mock.module("@/libs/prisma", () => ({
	prisma: {
		classroom: { findMany: mockClassroomFindMany },
		department: { findUnique: mockDepartmentFindUnique },
		program: { findUnique: mockProgramFindUnique },
		reportCheckIn: { findMany: mockReportCheckInFindMany },
		student: { count: mockStudentCount },
		teacher: { findMany: mockTeacherFindMany },
	},
}));

const { StatisticsService } = await import("@/modules/statistics/service");

describe("StatisticsService", () => {
	beforeEach(() => {
		for (const fn of [
			mockClassroomFindMany,
			mockDepartmentFindUnique,
			mockProgramFindUnique,
			mockReportCheckInFindMany,
			mockStudentCount,
			mockTeacherFindMany,
		]) {
			fn.mockReset();
		}

		mockStudentCount.mockResolvedValue(0);
		mockTeacherFindMany.mockResolvedValue([]);
		mockReportCheckInFindMany.mockResolvedValue([]);
		mockDepartmentFindUnique.mockResolvedValue(null);
		mockProgramFindUnique.mockResolvedValue(null);
	});

	it("filters department statistics by report classroomId when classroomKey is empty", async () => {
		mockClassroomFindMany.mockResolvedValueOnce([{ id: "class-1" }]);
		mockStudentCount.mockResolvedValueOnce(24);
		mockTeacherFindMany.mockResolvedValueOnce([
			{
				id: "teacher-1",
				teacherId: "T001",
				department: { name: "Computer" },
				program: null,
				user: {
					username: "teacher1",
					account: {
						title: "Mr.",
						firstName: "Active",
						lastName: "Teacher",
					},
				},
			},
		]);
		mockDepartmentFindUnique.mockResolvedValueOnce({ id: "dep-1", name: "Computer" });
		mockReportCheckInFindMany.mockResolvedValueOnce([
			{
				id: "report-1",
				teacherId: "teacher-1",
				teacherKey: null,
				checkInDate: new Date("2026-05-10T00:00:00.000Z"),
				present: ["student-1", "student-2"],
				absent: ["student-3"],
				late: [],
				leave: [],
				internship: [],
			},
		]);

		const result = await StatisticsService.getTermStats({
			startDate: "2026-05-01",
			endDate: "2026-05-31",
			departmentId: "dep-1",
		});

		expect(mockClassroomFindMany).toHaveBeenCalledWith({
			where: { departmentId: "dep-1" },
			select: { id: true },
		});
		expect(mockReportCheckInFindMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					OR: [
						{ classroomId: { in: ["class-1"] } },
						{ classroomKey: { in: ["class-1"] } },
					],
				}),
			}),
		);
		expect(result.studentCheckInStats.totalCheckInDays).toBe(1);
		expect(result.studentCheckInStats.checkedRecords).toBe(3);
		expect(result.studentCheckInStats.averageAttendanceRate).toBe(66.67);
		expect(result.teacherUsageStats.activeTeachers).toBe(1);
		expect(result.teacherUsageStats.activePercentage).toBe(100);
	});
});
