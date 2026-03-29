import { prisma } from "@/libs/prisma";

export abstract class GoodnessService {
	static async getByStudent(studentId: string, skip: number = 0, take: number = 20) {
		const [data, total] = await Promise.all([
			prisma.goodnessIndividual.findMany({
				where: { studentId },
				skip,
				take,
				orderBy: { goodDate: "desc" },
			}),
			prisma.goodnessIndividual.count({ where: { studentId } }),
		]);
		return { data, total, skip, take };
	}

	static async create(data: any) {
		const { goodDate, studentId, ...rest } = data;
		return prisma.goodnessIndividual.create({
			data: {
				...rest,
				studentId,
				studentKey: studentId,
				goodDate: goodDate ? new Date(goodDate) : new Date(),
			},
		});
	}

	static async createMany(records: any[]) {
		return prisma.goodnessIndividual.createMany({
			data: records.map(({ goodDate, ...rest }: any) => ({
				...rest,
				goodDate: goodDate ? new Date(goodDate) : new Date(),
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
		return prisma.goodnessIndividual.findMany({
			where: {
				...(classroomId ? { classroomId } : {}),
				...(studentId ? { studentId } : {}),
				...(startDate || endDate
					? {
							goodDate: {
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
			orderBy: { goodDate: "desc" },
		});
	}

	static async summary(params: { classroomId?: string; startDate?: string; endDate?: string }) {
		const { classroomId, startDate, endDate } = params;
		const records = await prisma.goodnessIndividual.findMany({
			where: {
				...(classroomId ? { classroomId } : {}),
				...(startDate || endDate
					? {
							goodDate: {
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
		const totalScore = records.reduce((s, r) => s + (r.goodnessScore ?? 0), 0);
		return { total: records.length, totalScore, records };
	}

	static async delete(id: string) {
		await prisma.goodnessIndividual.delete({ where: { id } });
	}
}