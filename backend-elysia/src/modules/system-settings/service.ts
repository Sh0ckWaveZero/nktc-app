import { prisma } from "@/libs/prisma";

export abstract class SystemSettingsService {
  static async getSettings() {
    let setting = await prisma.systemSetting.findFirst({
      where: { key: "system_config" },
    });

    if (!setting) {
      setting = await prisma.systemSetting.create({
        data: {
          key: "system_config",
          collegeAcronym: "COLLEGE",
          collegeName: "วิทยาลัย",
          collegeNameEn: "Technical College",
          securityEmail: "security@college.ac.th",
          primaryDataResidency: "วิทยาลัย",
          primaryServerDetail: "วิทยาลัย Server",
          drRegion: "ภูมิภาคเอเชียตะวันออกเฉียงใต้ (Southeast Asia Cloud Region)",
          systemUptime: "99.98%",
          latestAuditCycle: "มิถุนายน 2026 (Q2 2026 Audit Cycle)",
          latestAuditMonth: "มิถุนายน 2026",
        },
      });
    }

    return setting;
  }

  static async updateSettings(data: Record<string, any>, userId?: string) {
    const existing = await this.getSettings();

    return prisma.systemSetting.update({
      where: { id: existing.id },
      data: {
        ...(data.collegeAcronym && { collegeAcronym: data.collegeAcronym }),
        ...(data.collegeName && { collegeName: data.collegeName }),
        ...(data.collegeNameEn && { collegeNameEn: data.collegeNameEn }),
        ...(data.securityEmail && { securityEmail: data.securityEmail }),
        ...(data.primaryDataResidency && { primaryDataResidency: data.primaryDataResidency }),
        ...(data.primaryServerDetail && { primaryServerDetail: data.primaryServerDetail }),
        ...(data.drRegion && { drRegion: data.drRegion }),
        ...(data.systemUptime && { systemUptime: data.systemUptime }),
        ...(data.latestAuditCycle && { latestAuditCycle: data.latestAuditCycle }),
        ...(data.latestAuditMonth && { latestAuditMonth: data.latestAuditMonth }),
        updatedBy: userId,
      },
    });
  }
}
