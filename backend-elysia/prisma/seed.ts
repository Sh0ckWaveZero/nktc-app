import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient } from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || process.env.USER_ADMIN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.USER_PASSWORD;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error("❌ ADMIN_USERNAME/USER_ADMIN and ADMIN_PASSWORD/USER_PASSWORD environment variables are required for seeding");
  process.exit(1);
}

const levelData = [
  { levelId: "L001", levelName: "ปวช.", levelFullName: "ประกาศนียบัตรวิชาชีพ" },
  { levelId: "L002", levelName: "ปวส.", levelFullName: "ประกาศนียบัตรวิชาชีพชั้นสูง" },
];

const departmentData = [
  { departmentId: "D001", name: "แผนกวิชาช่างยนต์", description: "แผนกวิชาช่างยนต์" },
  { departmentId: "D002", name: "แผนกวิชาช่างกลโรงงาน", description: "แผนกวิชาช่างกลโรงงาน" },
  { departmentId: "D003", name: "แผนกวิชาช่างเชื่อมโลหะ", description: "แผนกวิชาช่างเชื่อมโลหะ" },
  { departmentId: "D004", name: "แผนกวิชาช่างไฟฟ้ากำลัง", description: "แผนกวิชาช่างไฟฟ้ากำลัง" },
  { departmentId: "D005", name: "แผนกวิชาช่างอิเล็กทรอนิกส์", description: "แผนกวิชาช่างอิเล็กทรอนิกส์" },
  { departmentId: "D006", name: "แผนกวิชาช่างก่อสร้าง", description: "แผนกวิชาช่างก่อสร้าง" },
  { departmentId: "D007", name: "แผนกวิชาเทคโนโลยีสารสนเทศ", description: "แผนกวิชาเทคโนโลยีสารสนเทศ" },
  { departmentId: "D008", name: "แผนกวิชาการบัญชี", description: "แผนกวิชาการบัญชี" },
  { departmentId: "D009", name: "แผนกวิชาการตลาด", description: "แผนกวิชาการตลาด" },
  { departmentId: "D010", name: "แผนกวิชาคอมพิวเตอร์ธุรกิจ", description: "แผนกวิชาคอมพิวเตอร์ธุรกิจ" },
];

const meta = { createdBy: "Admin", updatedBy: "Admin" };

async function seedLevels() {
  console.log("Seeding levels...");
  for (const item of levelData) {
    await prisma.level.upsert({
      where: { levelId: item.levelId },
      update: item,
      create: { ...item, ...meta },
    });
  }
  console.log(`✅ Levels: ${levelData.length} records`);
}

async function seedDepartments() {
  console.log("Seeding departments...");
  for (const item of departmentData) {
    const existing = await prisma.department.findFirst({
      where: { departmentId: item.departmentId },
    });
    if (existing) {
      await prisma.department.update({
        where: { id: existing.id },
        data: { name: item.name, description: item.description },
      });
    } else {
      await prisma.department.create({ data: { ...item, ...meta } });
    }
  }
  console.log(`✅ Departments: ${departmentData.length} records`);
}

async function seedAdmin() {
  console.log("Seeding admin users...");

  const usernames = Array.from(
    new Set(["superadmin", "admin", ADMIN_USERNAME].filter((u): u is string => Boolean(u)))
  );
  const password = await Bun.password.hash(ADMIN_PASSWORD, { algorithm: "bcrypt", cost: 12 });

  for (const username of usernames) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { username: username.toLowerCase() },
        ],
      },
      include: { account: true },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          password,
          role: "Admin",
          updatedBy: "Admin",
          account: existing.account
            ? { update: { firstName: "แอดมิน", lastName: "ระบบ", updatedBy: "Admin" } }
            : { create: { firstName: "แอดมิน", lastName: "ระบบ", ...meta } },
        },
      });
      console.log(`✅ Admin user '${existing.username}' updated successfully`);
    } else {
      await prisma.user.create({
        data: {
          username,
          password,
          role: "Admin",
          ...meta,
          account: {
            create: {
              firstName: "แอดมิน",
              lastName: "ระบบ",
              ...meta,
            },
          },
        },
      });
      console.log(`✅ Admin user '${username}' created successfully`);
    }
  }
}

async function seedSystemSettings() {
  console.log("Seeding system settings...");

  let localSettings: any = {};
  const localSeedPath = path.join(__dirname, "seed-data.local.json");

  if (fs.existsSync(localSeedPath)) {
    try {
      const fileData = fs.readFileSync(localSeedPath, "utf-8");
      localSettings = JSON.parse(fileData);
      console.log("📍 Loaded local seed configuration from seed-data.local.json");
    } catch (e) {
      console.warn("⚠️ Failed to parse seed-data.local.json, using environment defaults:", e);
    }
  }

  const collegeAcronym = localSettings.collegeAcronym || "COLLEGE";
  const collegeName = localSettings.collegeName || "วิทยาลัย";
  const collegeNameEn = localSettings.collegeNameEn || "Technical College";
  const securityEmail = localSettings.securityEmail || `security@${collegeAcronym.toLowerCase()}.ac.th`;
  const primaryDataResidency = localSettings.primaryDataResidency || collegeName;
  const primaryServerDetail = localSettings.primaryServerDetail || `${collegeName} Server`;
  const drRegion = localSettings.drRegion || "ภูมิภาคเอเชียตะวันออกเฉียงใต้ (Southeast Asia Cloud Region)";
  const systemUptime = localSettings.systemUptime || "99.98%";
  const latestAuditCycle = localSettings.latestAuditCycle || "มิถุนายน 2026 (Q2 2026 Audit Cycle)";
  const latestAuditMonth = localSettings.latestAuditMonth || "มิถุนายน 2026";

  try {
    const existing = await prisma.systemSetting.findFirst({
      where: { key: "system_config" },
    });

    if (existing) {
      await prisma.systemSetting.update({
        where: { id: existing.id },
        data: {
          collegeAcronym,
          collegeName,
          collegeNameEn,
          securityEmail,
          primaryDataResidency,
          primaryServerDetail,
          drRegion,
          systemUptime,
          latestAuditCycle,
          latestAuditMonth,
        },
      });
      console.log("✅ SystemSettings: updated 1 record");
    } else {
      await prisma.systemSetting.create({
        data: {
          key: "system_config",
          collegeAcronym,
          collegeName,
          collegeNameEn,
          securityEmail,
          primaryDataResidency,
          primaryServerDetail,
          drRegion,
          systemUptime,
          latestAuditCycle,
          latestAuditMonth,
        },
      });
      console.log("✅ SystemSettings: created 1 record");
    }
  } catch (error: any) {
    if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      console.warn("⚠️ Table system_setting does not exist in DB yet. Please run 'bun run prisma:push' first!");
    } else {
      throw error;
    }
  }
}

async function main() {
  console.log("🌱 Starting seed...");
  await seedLevels();
  await seedDepartments();
  await seedAdmin();
  await seedSystemSettings();
  console.log("🎉 Seed complete");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
