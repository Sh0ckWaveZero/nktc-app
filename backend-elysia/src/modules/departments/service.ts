import { prisma } from "@/libs/prisma";

export abstract class DepartmentService {
	static async getAll() {
		return prisma.department.findMany({ orderBy: { name: "asc" } });
	}
}