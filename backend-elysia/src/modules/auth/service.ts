import { prisma } from "@/libs/prisma";
import { compare, hash } from "bcryptjs";
import { Role } from "../../../generated/client";

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
			throw { status: 409, message: "User already exists" };
		}

		const hashedPassword = await hash(password, 12);

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
			throw { status: 401, message: "INVALID_CREDENTIALS" };
		}

		const isMatch = await compare(password, user.password);
		if (!isMatch) {
			throw { status: 401, message: "INVALID_CREDENTIALS" };
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

	static async validateRefreshToken(
		userId: string,
		refreshToken: string,
	) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user || !user.refreshToken) {
			throw { status: 401, message: "INVALID_REFRESH_TOKEN" };
		}

		const isValid = await compare(refreshToken, user.refreshToken);
		if (!isValid) {
			throw { status: 401, message: "INVALID_REFRESH_TOKEN" };
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
			throw { status: 404, message: "User not found" };
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
			throw { status: 404, message: "User not found" };
		}

		const isMatch = await compare(data.currentPassword, userData.password);
		if (!isMatch) {
			throw { status: 400, message: "Current password is incorrect" };
		}

		const hashed = await hash(data.newPassword, 10);
		await prisma.user.update({
			where: { id: userData.id },
			data: { password: hashed },
		});
	}

	static async hashToken(token: string) {
		return hash(token, 10);
	}
}