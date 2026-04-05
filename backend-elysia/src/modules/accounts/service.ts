import { prisma } from "@/libs/prisma";
import { NotFoundError } from "@/libs/errors";

export abstract class AccountService {
	static async create(data: any) {
		return prisma.account.create({ data });
	}

	static async getAll() {
		return prisma.account.findMany({
			include: { user: { select: { id: true, username: true, role: true } } },
		});
	}

	static async getById(id: string) {
		const account = await prisma.account.findUnique({
			where: { id },
			include: { user: { select: { id: true, username: true, role: true } } },
		});
		if (!account) {
			throw new NotFoundError("Account not found");
		}
		return account;
	}

	static async update(id: string, data: any) {
		return prisma.account.update({
			where: { id },
			data,
		});
	}

	static async delete(id: string) {
		await prisma.account.delete({ where: { id } });
	}
}