import { PrismaClient } from "@prisma/client";
import { classRoomData } from "./db/class-room";
import { departmentData } from "./db/department";
import { levelData } from "./db/level";
import { userStudentData } from "./db/user-student";


const prisma = new PrismaClient();

const main = async () => {

  console.log("Seeding...");
  seedUsers()
    // seedInitLevels()
    // seedInitDepartment()
    // seedInitClassRoom()
    .then(() => {
      console.log("Seeding complete 🎉")
    }).catch(err => {
      console.log("Seeding failed 😭", err);
    });
}

const seedUsers = async () => {
  const students = (await userStudentData()).map(async (item: any) => {
    return await prisma.user.create({
      data: item
    })
  });
  console.log(students);
}

const seedInitLevels = async () => {
  const level = await prisma.level.createMany({
    data: levelData()
  });
  console.log(level);
}

const seedInitDepartment = async () => {
  departmentData().forEach(async (item: any) => {
    return await prisma.department.create({ data: item })
  });
}

const seedInitClassRoom = async () => {
  classRoomData().forEach(async (item: any) => {
    return await prisma.classRoom.create({ data: item })
  });
}

main()
  .catch((err: any) => console.log(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
