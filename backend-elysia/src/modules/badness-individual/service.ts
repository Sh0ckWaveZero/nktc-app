import { prisma } from "@/libs/prisma";

export abstract class BadnessService {
	static async getByStudent(studentId: string, skip: number = 0, take: number = 20) {
		const [data, total] = await Promise.all([
			prisma.badnessIndividual.findMany({
				where: { studentId },
				skip,
				take,
				orderBy: { badDate: "desc" },
			}),
			prisma.badnessIndividual.count({ where: { studentId } }),
		]);
		return { data, total, skip, take };
	}

	static async create(data: any) {
		const { badDate, studentId, ...rest } = data;
		return prisma.badnessIndividual.create({
			data: {
				...rest,
				studentId,
				studentKey: studentId,
				badDate: badDate ? new Date(badDate) : new Date(),
			},
		});
	}

	static async createMany(records: any[]) {
		return prisma.badnessIndividual.createMany({
			data: records.map(({ badDate, ...rest }: any) => ({
				...rest,
				badDate: badDate ? new Date(badDate) : new Date(),
			})),
		});
	}

	static async search(params: {
		classroomId?: string;
		studentId?: string;
		startDate?: string;
		endDate?: string;
		skip?: number;
		take?: number;
	}) {
		const { classroomId, studentId, startDate, endDate, skip = 0, take = 50 } = params;
		return prisma.badnessIndividual.findMany({
			where: {
				...(classroomId ? { classroomId } : {}),
				...(studentId ? { studentId } : {}),
				...(startDate || endDate
					? {
							badDate: {
								...(startDate ? { gte: new Date(startDate) } : {}),
								...(endDate ? { lte: new Date(endDate) } : {}),
							},
						}
					: {}),
			},
			skip,
			take,
			include: {
				student: {
					include: {
						user: {
							include: {
								account: {
									select: { firstName: true, lastName: true, title: true, avatar: true },
								},
							},
						},
					},
				},
			},
			orderBy: { badDate: "desc" },
		});
	}

	static async summary(params: { classroomId?: string; startDate?: string; endDate?: string }) {
		const { classroomId, startDate, endDate } = params;
		const records = await prisma.badnessIndividual.findMany({
			where: {
				...(classroomId ? { classroomId } : {}),
				...(startDate || endDate
					? {
							badDate: {
								...(startDate ? { gte: new Date(startDate) } : {}),
								...(endDate ? { lte: new Date(endDate) } : {}),
							},
						}
					: {}),
			},
			include: {
				student: { include: { user: { include: { account: true } } } },
			},
		});
		const totalScore = records.reduce((s, r) => s + (r.badnessScore ?? 0), 0);
		return { total: records.length, totalScore, records };
	}

	static async delete(id: string) {
		await prisma.badnessIndividual.delete({ where: { id } });
	}
}