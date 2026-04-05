import "dotenv/config";
import { PrismaClient } from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const ADMIN_USERNAME = process.env.USER_ADMIN || "Admin01";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@1234";

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
  console.log("Seeding admin user...");

  const existing = await prisma.user.findUnique({
    where: { username: ADMIN_USERNAME },
  });

  if (existing) {
    console.log(`⏭️  Admin user "${ADMIN_USERNAME}" already exists, skipping`);
    return;
  }

  const password = await Bun.password.hash(ADMIN_PASSWORD, { algorithm: "bcrypt", cost: 12 });

  await prisma.user.create({
    data: {
      username: ADMIN_USERNAME,
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

  console.log(`✅ Admin user "${ADMIN_USERNAME}" created`);
}

async function main() {
  console.log("🌱 Starting seed...");
  await seedLevels();
  await seedDepartments();
  await seedAdmin();
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
