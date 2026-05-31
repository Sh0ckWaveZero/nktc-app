import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockTeacherFindMany = mock();
const mockTeacherFindUnique = mock();
const mockTeacherOnClassroomFindMany = mock();
const mockStudentFindMany = mock();
const mockStudentFindUnique = mock();
const mockVisitFindMany = mock();
const mockVisitFindFirst = mock();
const mockVisitFindUnique = mock();
const mockVisitCreate = mock();
const mockVisitUpdate = mock();

mock.module("@/libs/prisma", () => ({
	prisma: {
		teacher: {
			findMany: mockTeacherFindMany,
			findUnique: mockTeacherFindUnique,
		},
		teacherOnClassroom: {
			findMany: mockTeacherOnClassroomFindMany,
		},
		student: {
			findMany: mockStudentFindMany,
			findUnique: mockStudentFindUnique,
		},
		visitStudent: {
			findMany: mockVisitFindMany,
			findFirst: mockVisitFindFirst,
			findUnique: mockVisitFindUnique,
			create: mockVisitCreate,
			update: mockVisitUpdate,
		},
	},
}));

mock.module("@/infrastructure/logging", () => ({
	logger: { info: mock(), warn: mock(), error: mock(), debug: mock() },
	createLogger: () => ({ info: mock(), warn: mock(), error: mock(), debug: mock() }),
}));

const { VisitService } = await import("@/modules/visits/service");
const { BadRequestError, ForbiddenError } = await import("@/libs/errors");

describe("VisitService", () => {
	beforeEach(() => {
		for (const fn of [
			mockTeacherFindMany,
			mockTeacherFindUnique,
			mockTeacherOnClassroomFindMany,
			mockStudentFindMany,
			mockStudentFindUnique,
			mockVisitFindMany,
			mockVisitFindFirst,
			mockVisitFindUnique,
			mockVisitCreate,
			mockVisitUpdate,
		]) {
			fn.mockReset();
		}

		mockTeacherFindUnique.mockResolvedValue({ id: "teacher-1" });
		mockTeacherOnClassroomFindMany.mockResolvedValue([{ classroomId: "class-1" }]);
		mockTeacherFindMany.mockResolvedValue([]);
		mockStudentFindMany.mockResolvedValue([]);
		mockVisitFindMany.mockResolvedValue([]);
		mockVisitFindFirst.mockResolvedValue(null);
	});

	it("aggregates admin visit summary by advisor classrooms with recorded and total students", async () => {
		mockVisitFindMany.mockResolvedValueOnce([
			{
				id: "visit-1",
				studentKey: "student-1",
				visitDate: new Date("2026-05-18T00:00:00.000Z"),
				createdAt: new Date("2026-05-21T08:30:00.000Z"),
				updatedAt: new Date("2026-05-21T08:30:00.000Z"),
				createdBy: "user-1",
				images: ["img-1", "img-2", "img-3"],
				classroom: {
					id: "class-1",
					name: "ปวช.1/1",
					departmentId: "dep-1",
					department: {
						id: "dep-1",
						name: "เทคโนโลยีคอมพิวเตอร์",
					},
					_count: { student: 10 },
				},
			},
			{
				id: "visit-2",
				studentKey: "student-2",
				visitDate: new Date("2026-05-10T00:00:00.000Z"),
				createdAt: new Date("2026-05-22T09:15:00.000Z"),
				updatedAt: new Date("2026-05-22T09:15:00.000Z"),
				createdBy: "user-1",
				images: ["img-4", "img-5", "img-6"],
				classroom: {
					id: "class-2",
					name: "ปวช.1/2",
					departmentId: "dep-1",
					department: {
						id: "dep-1",
						name: "เทคโนโลยีคอมพิวเตอร์",
					},
					_count: { student: 12 },
				},
			},
		]);

		mockTeacherFindMany.mockResolvedValueOnce([
			{
				id: "teacher-1",
				userId: "user-1",
				department: {
					id: "dep-1",
					name: "เทคโนโลยีคอมพิวเตอร์",
				},
				user: {
					username: "teacher1",
					account: {
						title: "นาย",
						firstName: "ทดสอบ",
						lastName: "โอเค",
						avatar: null,
					},
				},
			},
		]);

		mockTeacherOnClassroomFindMany.mockResolvedValueOnce([
			{
				teacherId: "teacher-1",
				classroom: {
					id: "class-1",
					name: "ปวช.1/1-ช่างเทคนิคคอมพิวเตอร์",
					departmentId: "dep-1",
					department: {
						id: "dep-1",
						name: "เทคโนโลยีคอมพิวเตอร์",
					},
					_count: { student: 10 },
				},
			},
			{
				teacherId: "teacher-1",
				classroom: {
					id: "class-2",
					name: "ปวช.1/2-ช่างเทคนิคคอมพิวเตอร์",
					departmentId: "dep-1",
					department: {
						id: "dep-1",
						name: "เทคโนโลยีคอมพิวเตอร์",
					},
					_count: { student: 12 },
				},
			},
		]);

		const result = await VisitService.getAdminVisitSummaryReport({});

		expect(result).toEqual([
			{
				id: "นายทดสอบ โอเค:เทคโนโลยีคอมพิวเตอร์:ปวช.1/1-ช่างเทคนิคคอมพิวเตอร์, ปวช.1/2-ช่างเทคนิคคอมพิวเตอร์",
				teacherName: "นายทดสอบ โอเค",
				visitDate: "2026-05-22",
				latestRecordedAt: "2026-05-22",
				departmentName: "เทคโนโลยีคอมพิวเตอร์",
				classroomName: "ปวช.1/1-ช่างเทคนิคคอมพิวเตอร์, ปวช.1/2-ช่างเทคนิคคอมพิวเตอร์",
				recordedStudentCount: 2,
				studentCount: 22,
			},
		]);
	});

	it("ignores visit rows created by teachers who are not assigned as advisor teachers", async () => {
		mockVisitFindMany.mockResolvedValueOnce([
			{
				id: "visit-1",
				studentKey: "student-1",
				visitDate: new Date("2026-05-18T00:00:00.000Z"),
				createdAt: new Date("2026-05-21T08:30:00.000Z"),
				updatedAt: new Date("2026-05-21T08:30:00.000Z"),
				createdBy: "user-1",
				images: ["img-1", "img-2", "img-3"],
				classroom: {
					id: "class-1",
					name: "ปวส.2/4-ไฟฟ้า (ม.6)",
					departmentId: "dep-1",
					department: {
						id: "dep-1",
						name: "ไฟฟ้า",
					},
					_count: { student: 20 },
				},
			},
			{
				id: "visit-2",
				studentKey: "student-2",
				visitDate: new Date("2026-05-18T00:00:00.000Z"),
				createdAt: new Date("2026-05-22T08:30:00.000Z"),
				updatedAt: new Date("2026-05-22T08:30:00.000Z"),
				createdBy: "user-2",
				images: ["img-4", "img-5", "img-6"],
				classroom: {
					id: "class-2",
					name: "ปวส.2/5-ไฟฟ้า (ม.6)",
					departmentId: "dep-1",
					department: {
						id: "dep-1",
						name: "ไฟฟ้า",
					},
					_count: { student: 23 },
				},
			},
		]);

		mockTeacherFindMany.mockResolvedValueOnce([
			{
				id: "teacher-1",
				userId: "user-1",
				department: {
					id: "dep-1",
					name: "ไฟฟ้า",
				},
				user: {
					username: "teacher1",
					account: {
						title: "นาง",
						firstName: "กรรณิกา",
						lastName: "สายสิญจน์",
						avatar: null,
					},
				},
			},
			{
				id: "teacher-2",
				userId: "user-2",
				department: {
					id: "dep-1",
					name: "ไฟฟ้า",
				},
				user: {
					username: "teacher2",
					account: {
						title: "นาย",
						firstName: "ไม่ใช่",
						lastName: "ที่ปรึกษา",
						avatar: null,
					},
				},
			},
		]);

		mockTeacherOnClassroomFindMany.mockResolvedValueOnce([
			{
				teacherId: "teacher-1",
				classroom: {
					id: "class-1",
					name: "ปวส.2/4-ไฟฟ้า (ม.6)",
					departmentId: "dep-1",
					department: {
						id: "dep-1",
						name: "ไฟฟ้า",
					},
					_count: { student: 20 },
				},
			},
		]);

		const result = await VisitService.getAdminVisitSummaryReport({});

		expect(result).toEqual([
			{
				id: "นางกรรณิกา สายสิญจน์:ไฟฟ้า:ปวส.2/4-ไฟฟ้า (ม.6)",
				teacherName: "นางกรรณิกา สายสิญจน์",
				visitDate: "2026-05-21",
				latestRecordedAt: "2026-05-21",
				departmentName: "ไฟฟ้า",
				classroomName: "ปวส.2/4-ไฟฟ้า (ม.6)",
				recordedStudentCount: 1,
				studentCount: 20,
			},
		]);
	});

	it("returns only assigned classroom students with latest visit status", async () => {
		mockStudentFindMany.mockResolvedValueOnce([
			{
				id: "student-1",
				studentId: "67001",
				classroomId: "class-1",
				classroom: { id: "class-1", name: "ปวช.1/1" },
				user: {
					username: "student1",
					account: {
						title: "นาย",
						firstName: "ต้น",
						lastName: "กล้า",
						avatar: null,
					},
				},
			},
		]);
		mockVisitFindMany.mockResolvedValueOnce([
			{
				id: "visit-1",
				studentKey: "student-1",
				visitDate: new Date("2026-05-20T00:00:00.000Z"),
				visitNo: 1,
				academicYear: "2569",
				images: ["img-1", "img-2", "img-3"],
				visitDetail: { note: "ok", sdqAssessments: null },
				visitMap: null,
			},
		]);

		const result = await VisitService.getTeacherStudentVisits("user-1", {});

		expect(result).toEqual([
			{
				id: "student-1",
				studentKey: "student-1",
				studentId: "67001",
				fullName: "นายต้น กล้า",
				classroomId: "class-1",
				classroomName: "ปวช.1/1",
				visitId: "visit-1",
				visitDate: new Date("2026-05-20T00:00:00.000Z"),
				visitNo: 1,
				academicYear: "2569",
				visitStatus: "recorded",
				images: ["img-1", "img-2", "img-3"],
				visitDetail: { note: "ok", sdqAssessments: null },
				visitMap: null,
			},
		]);
	});

	it("creates a visit with visitNo 1 for an advisor student", async () => {
		mockStudentFindUnique.mockResolvedValueOnce({
			id: "student-1",
			studentId: "67001",
			classroomId: "class-1",
		});
		mockVisitCreate.mockResolvedValueOnce({ id: "visit-1" });

		const payload = {
			studentKey: "student-1",
			studentId: "67001",
			classroomId: "class-1",
			visitDate: "2026-05-21",
			images: ["img-1", "img-2", "img-3"],
			academicYear: "2569",
		};

		const result = await VisitService.create("user-1", payload);

		expect(result).toEqual({ id: "visit-1" });
		expect(mockVisitCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					studentKey: "student-1",
					studentId: "67001",
					classroomId: "class-1",
					visitNo: 1,
					images: ["img-1", "img-2", "img-3"],
					createdBy: "user-1",
					updatedBy: "user-1",
				}),
			}),
		);
	});

	it("rejects visit save when teacher does not own the classroom", async () => {
		await expect(
			VisitService.create("user-1", {
				studentKey: "student-1",
				studentId: "67001",
				classroomId: "class-2",
				visitDate: "2026-05-21",
				images: ["img-1", "img-2", "img-3"],
			}),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it("rejects visit save when image count is not exactly three", async () => {
		await expect(
			VisitService.create("user-1", {
				studentKey: "student-1",
				studentId: "67001",
				classroomId: "class-1",
				visitDate: "2026-05-21",
				images: ["img-1", "img-2"],
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});