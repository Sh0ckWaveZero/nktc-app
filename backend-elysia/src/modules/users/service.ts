import { prisma } from "@/libs/prisma";
import { compare, hash } from "bcryptjs";
import { NotFoundError, BadRequestError } from "@/libs/errors";

interface SecurityStatus {
	twoFactorEnabled: boolean;
	twoFactorCount: number;
	passkeyCount: number;
	activeSessionCount: number;
}

export abstract class UserService {
	/**
	 * Resolve legacy user by id, username, teacher.id หรือ student.id (คืนเฉพาะฟิลด์จำเป็น)
	 * AuthUser.id จะเท่ากับ User.id เสมอ (provision แบบ 1:1)
	 * รองรับการเรียกจากหน้า user view ที่ส่ง teacher.id หรือ student.id มา
	 */
	private static async resolveUserIdentity(identifier: string) {
		const direct = await prisma.user.findFirst({
			where: { OR: [{ id: identifier }, { username: identifier }] },
			select: { id: true, username: true },
		});
		if (direct) return direct;

		// Fallback: ค้นผ่าน teacher หรือ student relation (เหมือน updatePasswordByAdmin)
		const teacher = await prisma.teacher.findUnique({
			where: { id: identifier },
			select: { user: { select: { id: true, username: true } } },
		});
		if (teacher?.user) return teacher.user;

		const student = await prisma.student.findUnique({
			where: { id: identifier },
			select: { user: { select: { id: true, username: true } } },
		});
		if (student?.user) return student.user;

		throw new NotFoundError("User not found");
	}
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
		// resolve id/username/teacher.id/student.id -> user.id ก่อน แล้วค่อย fetch full
		const { id } = await this.resolveUserIdentity(identifier);
		const userData = await prisma.user.findUnique({
			where: { id },
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
		let userData = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!userData) {
			// Try finding user via teacher or student relation
			const teacher = await prisma.teacher.findUnique({
				where: { id: userId },
				include: { user: true },
			});
			if (teacher?.user) {
				userData = teacher.user;
			} else {
				const student = await prisma.student.findUnique({
					where: { id: userId },
					include: { user: true },
				});
				if (student?.user) {
					userData = student.user;
				}
			}
		}

		if (!userData) {
			throw new NotFoundError("User not found");
		}

		const hashed = await hash(newPassword, 10);
		await prisma.user.update({
			where: { id: userData.id },
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

	/**
	 * ดึงสถานะความปลอดภัยของ user (MFA, passkey, session)
	 * @param identifier id หรือ username ของ user
	 */
	static async getSecurityStatus(identifier: string): Promise<SecurityStatus> {
		const { id } = await this.resolveUserIdentity(identifier);

		const [authUser, twoFactorCount, passkeyCount, activeSessionCount] =
			await Promise.all([
				prisma.authUser.findUnique({
					where: { id },
					select: { twoFactorEnabled: true },
				}),
				prisma.authTwoFactor.count({ where: { userId: id } }),
				prisma.authPasskey.count({ where: { userId: id } }),
				prisma.authSession.count({ where: { userId: id } }),
			]);

		return {
			twoFactorEnabled: authUser?.twoFactorEnabled === true,
			twoFactorCount,
			passkeyCount,
			activeSessionCount,
		};
	}

	/**
	 * Admin reset MFA: ลบ TOTP secret + backup codes, ปิด twoFactorEnabled,
	 * และ revoke session ทั้งหมดเพื่อบังคับ login ใหม่
	 * @param identifier id หรือ username ของ user เป้าหมาย
	 * @param adminUsername username ของ admin ที่ทำรายการ (สำหรับ audit log)
	 */
	static async resetMfa(
		identifier: string,
		adminUsername: string,
	): Promise<{ twoFactorCount: number; revokedSessions: number }> {
		const { id, username } = await this.resolveUserIdentity(identifier);

		const result = await prisma.$transaction(async (tx) => {
			const deleted = await tx.authTwoFactor.deleteMany({
				where: { userId: id },
			});
			await tx.authUser.update({
				where: { id },
				data: { twoFactorEnabled: false },
			});
			const sessions = await tx.authSession.deleteMany({
				where: { userId: id },
			});
			return {
				twoFactorCount: deleted.count,
				revokedSessions: sessions.count,
			};
		});

		await this.writeSecurityAudit(
			"ResetMFA",
			id,
			username,
			adminUsername,
			`Admin ${adminUsername} reset MFA for user ${username}`,
		);

		return result;
	}

	/**
	 * Admin reset passkey: ลบ passkey ทั้งหมดของ user,
	 * และ revoke session ทั้งหมดเพื่อบังคับ login ใหม่
	 * @param identifier id หรือ username ของ user เป้าหมาย
	 * @param adminUsername username ของ admin ที่ทำรายการ (สำหรับ audit log)
	 */
	static async resetPasskey(
		identifier: string,
		adminUsername: string,
	): Promise<{ passkeyCount: number; revokedSessions: number }> {
		const { id, username } = await this.resolveUserIdentity(identifier);

		const result = await prisma.$transaction(async (tx) => {
			const deleted = await tx.authPasskey.deleteMany({
				where: { userId: id },
			});
			const sessions = await tx.authSession.deleteMany({
				where: { userId: id },
			});
			return {
				passkeyCount: deleted.count,
				revokedSessions: sessions.count,
			};
		});

		await this.writeSecurityAudit(
			"ResetPasskey",
			id,
			username,
			adminUsername,
			`Admin ${adminUsername} reset passkeys for user ${username}`,
		);

		return result;
	}

	/**
	 * เขียน audit log สำหรับการ reset ความปลอดภัย (best-effort ไม่โยนเมื่อ fail)
	 */
	private static async writeSecurityAudit(
		action: string,
		userId: string,
		username: string,
		adminUsername: string,
		detail: string,
	): Promise<void> {
		try {
			await prisma.auditLog.create({
				data: {
					action,
					model: "AuthUser",
					recordId: userId,
					detail,
					createdBy: adminUsername,
				},
			});
		} catch (error) {
			console.error(`[users] failed to write ${action} audit log`, {
				userId,
				username,
				adminUsername,
				error,
			});
		}
	}
}
