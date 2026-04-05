import { prisma } from "@/libs/prisma";

export abstract class VisitService {
	static async getAll(params: {
		classroomId?: string;
		academicYear?: string;
		visitNo?: string;
	}) {
		const { classroomId, academicYear, visitNo } = params;
		return prisma.visitStudent.findMany({
			where: {
				...(classroomId ? { classroomId } : {}),
				...(academicYear ? { academicYear } : {}),
				...(visitNo ? { visitNo: Number(visitNo) } : {}),
			},
			include: {
				student: {
					include: {
						user: {
							include: {
								account: {
									select: {
										firstName: true,
										lastName: true,
										title: true,
										avatar: true,
									},
								},
							},
						},
					},
				},
				classroom: true,
			},
			orderBy: { visitDate: "desc" },
		});
	}
}