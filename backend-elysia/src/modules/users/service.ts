import { prisma } from "@/libs/prisma";
import { compare, hash } from "bcryptjs";
import { NotFoundError, BadRequestError } from "@/libs/errors";

export abstract class UserService {
	static async getUserById(userId: string) {
		const userData = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				account: true,
				teacher: { include: { department: true } },
				student: { include: { classroom: true } },
			},
		});

		if (!userData) {
			throw new NotFoundError("User not found");
		}

		const { password: _, refreshToken: __, ...rest } = userData;
		return rest;
	}

	static async getUserByIdentifier(identifier: string) {
		const userData = await prisma.user.findFirst({
			where: { OR: [{ id: identifier }, { username: identifier }] },
			include: {
				account: true,
				student: { include: { classroom: true } },
				teacher: { include: { department: true } },
			},
		});

		if (!userData) {
			throw new NotFoundError("User not found");
		}

		const { password: _, refreshToken: __, ...rest } = userData;
		return rest;
	}

	static async updatePassword(
		userId: string,
		data: { currentPassword: string; newPassword: string },
	) {
		const userData = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!userData) {
			throw new NotFoundError("User not found");
		}

		const isMatch = await compare(data.currentPassword, userData.password);
		if (!isMatch) {
			throw new BadRequestError("Current password is incorrect", "currentPassword");
		}

		const hashed = await hash(data.newPassword, 10);
		await prisma.user.update({
			where: { id: userData.id },
			data: { password: hashed },
		});
	}

	static async updatePasswordByAdmin(userId: string, newPassword: string) {
		const userData = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!userData) {
			throw new NotFoundError("User not found");
		}

		const hashed = await hash(newPassword, 10);
		await prisma.user.update({
			where: { id: userId },
			data: { password: hashed },
		});
	}

	static async getAuditLogsByUsername(
		username: string,
		skip: number = 0,
		take: number = 20,
	) {
		return prisma.auditLog.findMany({
			where: { createdBy: username },
			skip,
			take,
			orderBy: { createdAt: "desc" },
		});
	}
}
