import { prisma } from "@/libs/prisma";
import { programInclude } from "./model";
import { NotFoundError } from "@/libs/errors";

export abstract class ProgramService {
	static async getAll() {
		return prisma.program.findMany({
			include: programInclude,
			orderBy: { name: "asc" },
		});
	}

	static async getById(id: string) {
		const program = await prisma.program.findUnique({
			where: { id },
			include: programInclude,
		});
		if (!program) {
			throw new NotFoundError("Program not found");
		}
		return program;
	}

	static async create(data: any) {
		return prisma.program.create({ data });
	}

	static async update(id: string, data: any) {
		return prisma.program.update({ where: { id }, data });
	}

	static async delete(id: string) {
		await prisma.program.delete({ where: { id } });
	}
}