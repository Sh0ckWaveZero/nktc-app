import { prisma } from "@/libs/prisma";

export abstract class LevelService {
	static async getAll() {
		return prisma.level.findMany({ orderBy: { levelId: "asc" } });
	}
}