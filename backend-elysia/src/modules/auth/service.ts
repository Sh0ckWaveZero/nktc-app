import { prisma } from "@/libs/prisma";
import { Role } from "../../../generated/client";

import {
	ConflictError,
	NotFoundError,
	UnauthorizedError,
	BadRequestError,
} from "@/libs/errors";

interface LegacyCredentialUser {
	id: string;
	username: string;
	password: string;
	email: string | null;
	createdAt: Date;
	updatedAt: Date;
	account?: {
		firstName?: string | null;
		lastName?: string | null;
		avatar?: string | null;
	} | null;
}

const provisionBetterAuthCredential = async (user: LegacyCredentialUser): Promise<void> => {
	const displayName = [user.account?.firstName, user.account?.lastName]
		.filter(Boolean)
		.join(" ") || user.username;
	const email = user.email || `${user.id}@legacy.nktc.invalid`;

	await prisma.$transaction(async (transaction) => {
		await transaction.authUser.upsert({
			where: { legacyUserId: user.id },
			create: {
				id: user.id,
				legacyUserId: user.id,
				name: displayName,
				email,
				emailVerified: Boolean(user.email),
				image: user.account?.avatar,
				username: user.username,
				displayUsername: user.username,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
			update: {
				name: displayName,
				email,
				emailVerified: Boolean(user.email),
				image: user.account?.avatar,
				username: user.username,
				displayUsername: user.username,
			},
		});

		const credentialAccount = await transaction.authAccount.findFirst({
			where: {
				userId: user.id,
				providerId: "credential",
			},
			select: { id: true },
		});

		if (credentialAccount) {
			await transaction.authAccount.update({
				where: { id: credentialAccount.id },
				data: {
					accountId: user.id,
					password: user.password,
				},
			});
			return;
		}

		await transaction.authAccount.create({
			data: {
				id: crypto.randomUUID(),
				accountId: user.id,
				providerId: "credential",
				userId: user.id,
				password: user.password,
			},
		});
	});
};

export abstract class AuthService {
	static async register(data: {
		username: string;
		password: string;
		email?: string;
		role?: string;
	}) {
		const { username, password, ...rest } = data;

		const existingUser = await prisma.user.findFirst({
			where: { username },
		});

		if (existingUser) {
			throw new ConflictError("User already exists", "username");
		}

		const hashedPassword = await Bun.password.hash(password);

		const user = await prisma.user.create({
			data: {
				username,
				password: hashedPassword,
				email: rest.email,
				role: rest.role as Role | undefined,
			},
		});

		const { password: _, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	static async login(data: { username: string; password: string }) {
		const { username, password } = data;

		const user = await prisma.user.findFirst({
			where: { username },
			include: {
				account: {
					select: {
						id: true,
						title: true,
						firstName: true,
						lastName: true,
						avatar: true,
						birthDate: true,
					},
				},
				teacher: {
					select: {
						id: true,
						teacherId: true,
						jobTitle: true,
						academicStanding: true,
						classrooms: true,
						department: true,
						status: true,
					},
				},
				student: {
					include: {
						classroom: true,
					},
				},
			},
		});

		if (!user) {
			throw new UnauthorizedError("Invalid credentials");
		}

		const isMatch = await Bun.password.verify(password, user.password);
		if (!isMatch) {
			throw new UnauthorizedError("Invalid credentials");
		}

		let teacherOnClassroom: string[] = [];
		if (user.teacher) {
			const toc = await prisma.teacherOnClassroom.findMany({
				where: { teacherId: user.teacher.id },
				select: { classroomId: true },
			});
			teacherOnClassroom = toc.map((item) => item.classroomId);
		}

		return {
			user: { ...user, teacherOnClassroom },
			userId: user.id,
			username: user.username,
			roles: user.role,
		};
	}

	static async prepareBetterAuthLogin(data: { username: string; password: string }) {
		const result = await this.login(data);
		await provisionBetterAuthCredential(result.user);
		return { id: result.userId, username: result.username };
	}

	static async isMfaEnabled(userId: string): Promise<boolean> {
		const user = await prisma.authUser.findUnique({
			where: { id: userId },
			select: { twoFactorEnabled: true },
		});
		return user?.twoFactorEnabled === true;
	}

	static async validateRefreshToken(
		userId: string,
		refreshToken: string,
	) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user || !user.refreshToken) {
			throw new UnauthorizedError("Invalid refresh token");
		}

		const isValid = await Bun.password.verify(refreshToken, user.refreshToken);
		if (!isValid) {
			throw new UnauthorizedError("Invalid refresh token");
		}

		return {
			userId: user.id,
			username: user.username,
			roles: user.role,
		};
	}

	static async getUser(userId: string) {
		const userData = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				account: {
					select: {
						id: true,
						title: true,
						firstName: true,
						lastName: true,
						avatar: true,
						birthDate: true,
					},
				},
				teacher: {
					select: {
						id: true,
						teacherId: true,
						jobTitle: true,
						academicStanding: true,
						classrooms: true,
						department: true,
						status: true,
					},
				},
				student: {
					include: {
						classroom: true,
					},
				},
			},
		});

		if (!userData) {
			throw new NotFoundError("User not found");
		}

		let teacherOnClassroom: string[] = [];
		if (userData.teacher) {
			const toc = await prisma.teacherOnClassroom.findMany({
				where: { teacherId: userData.teacher.id },
				select: { classroomId: true },
			});
			teacherOnClassroom = toc.map((item) => item.classroomId);
		}

		const { password: _, ...rest } = { ...userData, teacherOnClassroom };
		return rest;
	}

	static async logout(userId: string) {
		await prisma.user.update({
			where: { id: userId },
			data: { refreshToken: null },
		});
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

		const isMatch = await Bun.password.verify(data.currentPassword, userData.password);
		if (!isMatch) {
			throw new BadRequestError("Current password is incorrect", "currentPassword");
		}

		const hashed = await Bun.password.hash(data.newPassword);
		await prisma.$transaction(async (transaction) => {
			await transaction.user.update({
				where: { id: userData.id },
				data: { password: hashed },
			});

			const credentialAccount = await transaction.authAccount.findFirst({
				where: {
					userId: userData.id,
					providerId: "credential",
				},
				select: { id: true },
			});

			if (credentialAccount) {
				await transaction.authAccount.update({
					where: { id: credentialAccount.id },
					data: { password: hashed },
				});
			}
		});
	}

	static async hashToken(token: string) {
		return Bun.password.hash(token);
	}
}
