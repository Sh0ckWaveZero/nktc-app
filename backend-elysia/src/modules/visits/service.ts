import { BadRequestError, ForbiddenError, NotFoundError } from "@/libs/errors";
import { prisma } from "@/libs/prisma";

const VISIT_ACCOUNT_SELECT = {
	firstName: true,
	lastName: true,
	title: true,
	avatar: true,
} as const;

const VISIT_INCLUDE = {
	student: {
		include: {
			user: {
				include: {
					account: {
						select: VISIT_ACCOUNT_SELECT,
					},
				},
			},
			classroom: true,
		},
	},
	classroom: true,
} as const;

type VisitListParams = {
	classroomId?: string;
	academicYear?: string;
	visitNo?: string;
	departmentId?: string;
};

type TeacherVisitListParams = {
	classroomId?: string;
	academicYear?: string;
};

type VisitWriteParams = {
	studentKey: string;
	studentId: string;
	classroomId: string;
	visitDate: string;
	images: string[];
	academicYear?: string;
	visitDetail?: unknown;
	visitMap?: string | null;
};

type AdminVisitReportRow = {
	id: string;
	teacherName: string;
	visitDate: string;
	latestRecordedAt: string;
	departmentName: string;
	classroomName: string;
	recordedStudentCount: number;
	studentCount: number;
};

export abstract class VisitService {
	static async getAll(params: VisitListParams) {
		const { classroomId, academicYear, visitNo } = params;
		const visits = await prisma.visitStudent.findMany({
			where: {
				...(classroomId ? { classroomId } : {}),
				...(academicYear ? { academicYear } : {}),
				...(visitNo ? { visitNo: Number(visitNo) } : {}),
			},
			include: VISIT_INCLUDE,
			orderBy: [{ visitDate: "desc" }, { updatedAt: "desc" }],
		});
		return visits.filter(
			(visit) => visit.images && visit.images.length > 0 && visit.images.some((img) => img && img.trim() !== "")
		);
	}

	static async getAdminVisitSummaryReport(params: VisitListParams): Promise<AdminVisitReportRow[]> {
		const { classroomId, academicYear, visitNo, departmentId } = params;

		const visits = await prisma.visitStudent.findMany({
			where: {
				...(classroomId ? { classroomId } : {}),
				...(academicYear ? { academicYear } : {}),
				...(visitNo ? { visitNo: Number(visitNo) } : {}),
			},
			select: {
				id: true,
				studentKey: true,
				visitDate: true,
				createdAt: true,
				updatedAt: true,
				createdBy: true,
				images: true,
				classroom: {
					select: {
						id: true,
						name: true,
						departmentId: true,
						_count: {
							select: {
								student: true,
							},
						},
						department: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
			orderBy: [{ updatedAt: "desc" }, { visitDate: "desc" }],
		});

		const realVisits = visits.filter(
			(visit) => visit.images && visit.images.length > 0 && visit.images.some((img) => img && img.trim() !== "")
		);

		const creatorIds = [
			...new Set(realVisits.map((visit) => visit.createdBy).filter((createdBy): createdBy is string => Boolean(createdBy))),
		];

		const teachers = creatorIds.length
			? await prisma.teacher.findMany({
					where: {
						userId: { in: creatorIds },
					},
					select: {
						id: true,
						userId: true,
						department: {
							select: {
								id: true,
								name: true,
							},
						},
						user: {
							select: {
								username: true,
								account: {
									select: VISIT_ACCOUNT_SELECT,
								},
							},
						},
					},
				})
			: [];

		const teacherIds = teachers.map((teacher) => teacher.id);

		const advisorAssignments = teacherIds.length
			? await prisma.teacherOnClassroom.findMany({
					where: {
						teacherId: { in: teacherIds },
					},
					select: {
						teacherId: true,
						classroom: {
							select: {
								id: true,
								name: true,
								departmentId: true,
								department: {
									select: {
										id: true,
										name: true,
									},
								},
								_count: {
									select: {
										student: true,
									},
								},
							},
						},
					},
				})
			: [];

		const advisorClassroomsByTeacherId = new Map<
			string,
			Array<{
				id: string;
				name: string;
				departmentId: string | null;
				departmentName: string;
				studentCount: number;
			}>
		>();

		for (const assignment of advisorAssignments) {
			if (!assignment.classroom) {
				continue;
			}

			const advisorClassrooms = advisorClassroomsByTeacherId.get(assignment.teacherId) ?? [];
			advisorClassrooms.push({
				id: assignment.classroom.id,
				name: assignment.classroom.name?.trim() || "-",
				departmentId: assignment.classroom.departmentId ?? assignment.classroom.department?.id ?? null,
				departmentName: assignment.classroom.department?.name?.trim() || "-",
				studentCount: assignment.classroom._count?.student ?? 0,
			});
			advisorClassroomsByTeacherId.set(assignment.teacherId, advisorClassrooms);
		}

		const teacherByUserId = new Map(
			teachers.map((teacher) => {
				const account = teacher.user?.account;
				const teacherName = `${account?.title ?? ""}${account?.firstName ?? ""} ${account?.lastName ?? ""}`.trim();
				const advisorClassrooms = advisorClassroomsByTeacherId.get(teacher.id) ?? [];

				return [
					teacher.userId ?? "",
					{
						teacherId: teacher.id,
						teacherName: teacherName || teacher.user?.username || "-",
						departmentId: teacher.department?.id ?? null,
						departmentName: teacher.department?.name?.trim() || "-",
						advisorClassrooms,
					},
				] as const;
			}),
		);

		const summaryMap = new Map<
			string,
			{
				teacherName: string;
				latestRecordedAt: string;
				departmentName: string;
				classroomName: string;
				recordedStudentKeys: Set<string>;
				studentCount: number;
			}
		>();

		for (const visit of realVisits) {
			const latestRecordedAtSource = visit.updatedAt ?? visit.createdAt;

			if (!latestRecordedAtSource) {
				continue;
			}

			const latestRecordedAt = latestRecordedAtSource.toISOString().slice(0, 10);
			const teacherInfo = (visit.createdBy && teacherByUserId.get(visit.createdBy)) || null;
			const teacherName = teacherInfo?.teacherName || "-";
			const advisorClassrooms = teacherInfo?.advisorClassrooms ?? [];
			const scopedAdvisorClassrooms = departmentId
				? advisorClassrooms.filter((advisorClassroom) => advisorClassroom.departmentId === departmentId)
				: advisorClassrooms;
			const matchedAdvisorClassroom = visit.classroom?.id
				? scopedAdvisorClassrooms.find((advisorClassroom) => advisorClassroom.id === visit.classroom?.id)
				: null;

			if (scopedAdvisorClassrooms.length === 0 || !matchedAdvisorClassroom) {
				continue;
			}

			const departmentName = matchedAdvisorClassroom.departmentName;
			const resolvedDepartmentId = matchedAdvisorClassroom.departmentId || departmentName;
			const classroomName = [...new Set(scopedAdvisorClassrooms.map((advisorClassroom) => advisorClassroom.name))]
				.sort((left, right) => left.localeCompare(right, "th"))
				.join(", ");
			const studentCount = scopedAdvisorClassrooms.reduce(
				(sum, advisorClassroom) => sum + advisorClassroom.studentCount,
				0,
			);

			const summaryKey = `${visit.createdBy ?? "unknown"}:${resolvedDepartmentId ?? departmentName}`;
			const existingSummary = summaryMap.get(summaryKey);

			if (existingSummary) {
				if (visit.studentKey) {
					existingSummary.recordedStudentKeys.add(visit.studentKey);
				}

				if (latestRecordedAt > existingSummary.latestRecordedAt) {
					existingSummary.latestRecordedAt = latestRecordedAt;
				}

				if (existingSummary.studentCount === 0 && studentCount > 0) {
					existingSummary.studentCount = studentCount;
				}

				if (existingSummary.departmentName === "-" && departmentName !== "-") {
					existingSummary.departmentName = departmentName;
				}

				if (existingSummary.classroomName === "-" && classroomName !== "-") {
					existingSummary.classroomName = classroomName;
				}

				continue;
			}

			const recordedStudentKeys = new Set<string>();

			if (visit.studentKey) {
				recordedStudentKeys.add(visit.studentKey);
			}

			summaryMap.set(summaryKey, {
				teacherName,
				latestRecordedAt,
				departmentName,
				classroomName,
				recordedStudentKeys,
				studentCount,
			});
		}

		return [...summaryMap.values()]
			.map((item) => ({
				id: `${item.teacherName}:${item.departmentName}:${item.classroomName}`,
				teacherName: item.teacherName,
				visitDate: item.latestRecordedAt,
				latestRecordedAt: item.latestRecordedAt,
				departmentName: item.departmentName,
				classroomName: item.classroomName,
				recordedStudentCount: item.recordedStudentKeys.size,
				studentCount: item.studentCount,
			}))
			.sort((left, right) => {
				if (left.latestRecordedAt !== right.latestRecordedAt) {
					return right.latestRecordedAt.localeCompare(left.latestRecordedAt);
				}

				if (left.departmentName !== right.departmentName) {
					return left.departmentName.localeCompare(right.departmentName, "th");
				}

				if (left.classroomName !== right.classroomName) {
					return left.classroomName.localeCompare(right.classroomName, "th");
				}

				return left.teacherName.localeCompare(right.teacherName, "th");
			});
	}

	static async getTeacherStudentVisits(userId: string, params: TeacherVisitListParams) {
		const { scopedClassroomIds } = await this.getTeacherScope(userId, params.classroomId);

		if (scopedClassroomIds.length === 0) {
			return [];
		}

		const students = await prisma.student.findMany({
			where: {
				classroomId: { in: scopedClassroomIds },
			},
			include: {
				user: {
					include: {
						account: {
							select: VISIT_ACCOUNT_SELECT,
						},
					},
				},
				classroom: true,
			},
		});

		const studentKeys = students.map((student) => student.id);

		if (studentKeys.length === 0) {
			return [];
		}

		const visits = await prisma.visitStudent.findMany({
			where: {
				studentKey: { in: studentKeys },
				...(params.academicYear ? { academicYear: params.academicYear } : {}),
			},
			orderBy: [{ visitDate: "desc" }, { updatedAt: "desc" }],
		});

		// Group visits by studentKey
		const visitsByStudent = new Map<string, typeof visits>();
		for (const visit of visits) {
			const list = visitsByStudent.get(visit.studentKey) ?? [];
			list.push(visit);
			visitsByStudent.set(visit.studentKey, list);
		}

		return students
			.map((student) => {
				const studentVisits = visitsByStudent.get(student.id) ?? [];

				// Find if there is any real home visit (has non-empty images)
				const realVisit = studentVisits.find(
					(v) => v.images && v.images.length > 0 && v.images.some((img) => img && img.trim() !== "")
				);

				// Collect all SDQ assessments from all visits of this student
				const allSdqAssessments: any[] = [];
				for (const v of studentVisits) {
					const detail = v.visitDetail as any;
					if (detail && Array.isArray(detail.sdqAssessments)) {
						allSdqAssessments.push(...detail.sdqAssessments);
					}
				}

				// Sort allSdqAssessments by submittedAt descending to ensure chronological order
				allSdqAssessments.sort((a, b) => {
					const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
					const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
					return dateB - dateA;
				});

				const account = student.user?.account;
				const fullName = `${account?.title ?? ""}${account?.firstName ?? ""} ${account?.lastName ?? ""}`.trim();

				if (realVisit) {
					const mergedDetail = {
						...(realVisit.visitDetail as any || {}),
						sdqAssessments: allSdqAssessments.length > 0 ? allSdqAssessments : null,
					};

					return {
						id: student.id,
						studentKey: student.id,
						studentId: student.studentId ?? "-",
						fullName: fullName || student.user?.username || "-",
						classroomId: student.classroomId,
						classroomName: student.classroom?.name ?? "-",
						visitId: realVisit.id,
						visitDate: realVisit.visitDate,
						visitNo: realVisit.visitNo,
						academicYear: realVisit.academicYear ?? params.academicYear ?? this.getCurrentAcademicYear(),
						visitStatus: "recorded" as const,
						images: realVisit.images,
						visitDetail: mergedDetail,
						visitMap: realVisit.visitMap,
					};
				}

				// If no real visit, check if there is an SDQ-only visit
				const sdqVisit = studentVisits[0]; // Take the latest visit record as fallback
				if (sdqVisit) {
					const mergedDetail = {
						...(sdqVisit.visitDetail as any || {}),
						sdqAssessments: allSdqAssessments.length > 0 ? allSdqAssessments : null,
					};

					return {
						id: student.id,
						studentKey: student.id,
						studentId: student.studentId ?? "-",
						fullName: fullName || student.user?.username || "-",
						classroomId: student.classroomId,
						classroomName: student.classroom?.name ?? "-",
						visitId: sdqVisit.id,
						visitDate: sdqVisit.visitDate,
						visitNo: sdqVisit.visitNo,
						academicYear: sdqVisit.academicYear ?? params.academicYear ?? this.getCurrentAcademicYear(),
						visitStatus: "pending" as const,
						images: sdqVisit.images,
						visitDetail: mergedDetail,
						visitMap: sdqVisit.visitMap,
					};
				}

				// No visit record at all
				return {
					id: student.id,
					studentKey: student.id,
					studentId: student.studentId ?? "-",
					fullName: fullName || student.user?.username || "-",
					classroomId: student.classroomId,
					classroomName: student.classroom?.name ?? "-",
					visitId: null,
					visitDate: null,
					visitNo: null,
					academicYear: params.academicYear ?? this.getCurrentAcademicYear(),
					visitStatus: "pending" as const,
					images: [],
					visitDetail: null,
					visitMap: null,
				};
			})
			.sort((left, right) => {
				if (left.classroomName !== right.classroomName) {
					return left.classroomName.localeCompare(right.classroomName, "th");
				}
				return left.fullName.localeCompare(right.fullName, "th");
			});
	}

	static async getById(userId: string, id: string) {
		const visit = await prisma.visitStudent.findUnique({
			where: { id },
			include: VISIT_INCLUDE,
		});

		if (!visit) {
			throw new NotFoundError("Visit record not found");
		}

		await this.assertTeacherCanAccessVisit(userId, visit.classroomId);

		return visit;
	}

	static async create(userId: string, data: VisitWriteParams) {
		this.assertImages(data.images);
		await this.assertTeacherCanAccessVisit(userId, data.classroomId);

		const student = await prisma.student.findUnique({
			where: { id: data.studentKey },
			select: {
				id: true,
				studentId: true,
				classroomId: true,
			},
		});

		if (!student) {
			throw new NotFoundError("Student not found");
		}

		if (student.classroomId !== data.classroomId) {
			throw new ForbiddenError("Student is not assigned to this classroom");
		}

		const academicYear = data.academicYear ?? this.getCurrentAcademicYear();

		const latestVisit = await prisma.visitStudent.findFirst({
			where: {
				studentKey: data.studentKey,
			},
			orderBy: [{ visitNo: "desc" }, { updatedAt: "desc" }],
			select: {
				visitNo: true,
			},
		});

		return prisma.visitStudent.create({
			data: {
				studentKey: data.studentKey,
				studentId: student.studentId ?? data.studentId,
				classroomId: data.classroomId,
				visitDate: new Date(data.visitDate),
				images: data.images,
				academicYear,
				visitDetail: data.visitDetail ?? null,
				visitMap: data.visitMap ?? null,
				visitNo: (latestVisit?.visitNo ?? 0) + 1,
				createdBy: userId,
				updatedBy: userId,
			},
			include: VISIT_INCLUDE,
		});
	}

	static async update(userId: string, id: string, data: VisitWriteParams) {
		this.assertImages(data.images);

		const existingVisit = await prisma.visitStudent.findUnique({
			where: { id },
			select: {
				id: true,
				studentKey: true,
				classroomId: true,
				studentId: true,
				academicYear: true,
			},
		});

		if (!existingVisit) {
			throw new NotFoundError("Visit record not found");
		}

		const classroomId = data.classroomId ?? existingVisit.classroomId ?? undefined;

		if (!classroomId) {
			throw new BadRequestError("Classroom is required", "classroomId");
		}

		await this.assertTeacherCanAccessVisit(userId, classroomId);

		if (data.studentKey && data.studentKey !== existingVisit.studentKey) {
			throw new BadRequestError("Cannot change student for existing visit", "studentKey");
		}

		return prisma.visitStudent.update({
			where: { id },
			data: {
				studentId: data.studentId || existingVisit.studentId,
				classroomId,
				visitDate: new Date(data.visitDate),
				images: data.images,
				academicYear: data.academicYear ?? existingVisit.academicYear ?? this.getCurrentAcademicYear(),
				visitDetail: data.visitDetail ?? null,
				visitMap: data.visitMap ?? null,
				updatedBy: userId,
			},
			include: VISIT_INCLUDE,
		});
	}

	private static async getTeacherScope(userId: string, classroomId?: string) {
		const teacher = await prisma.teacher.findUnique({
			where: { userId },
			select: { id: true },
		});

		if (!teacher) {
			return {
				teacherId: null,
				scopedClassroomIds: [] as string[],
			};
		}

		const assignments = await prisma.teacherOnClassroom.findMany({
			where: { teacherId: teacher.id },
			select: { classroomId: true },
		});

		const classroomIds = assignments.map((assignment) => assignment.classroomId);

		if (!classroomId) {
			return {
				teacherId: teacher.id,
				scopedClassroomIds: classroomIds,
			};
		}

		if (!classroomIds.includes(classroomId)) {
			throw new ForbiddenError("You do not have access to this classroom");
		}

		return {
			teacherId: teacher.id,
			scopedClassroomIds: [classroomId],
		};
	}

	private static async assertTeacherCanAccessVisit(userId: string, classroomId?: string | null) {
		if (!classroomId) {
			throw new BadRequestError("Classroom is required", "classroomId");
		}

		const { teacherId } = await this.getTeacherScope(userId, classroomId);

		if (!teacherId) {
			throw new ForbiddenError("Only advisor teachers can manage visit records");
		}
	}

	private static assertImages(images: string[]) {
		if (images.length !== 3) {
			throw new BadRequestError("กรุณาอัปโหลดรูปภาพประกอบ 3 รูป", "images");
		}
	}

	private static getCurrentAcademicYear() {
		return String(new Date().getFullYear() + 543);
	}
}