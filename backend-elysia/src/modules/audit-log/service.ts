import { prisma } from "@/libs/prisma";

export abstract class AuditLogService {
	static async getByUsername(username: string) {
		return prisma.auditLog.findMany({
			where: { createdBy: username },
			orderBy: { createdAt: "desc" },
		});
	}
}