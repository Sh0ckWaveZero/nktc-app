import { PrismaClient } from "@prisma/client";
import { classRoomData } from "./db/class-room";
import { programData } from "./db/program";
import { levelData } from "./db/level";
import { userStudentData } from "./db/user-student";
import { departmentData } from './db/department';
import { classNameData } from './db/class-name';


const prisma = new PrismaClient();

const main = async () => {

  console.log("Seeding...");
  // seedLevels()
  // seedProgram()
  // seedDepartment()
  // seedInitClassRoom()
  seedClassName()
    // seedUsers()
    .then(() => {
      console.log("Seeding complete 🎉")
    }).catch(err => {
      console.log("Seeding failed 😭", err);
    });
}

const seedLevels = async () => {
  const level = levelData().forEach(async (item: any) => {
    return await prisma.level.create({ data: item })
  });
  console.log(level);
}

const seedProgram = async () => {
  programData().forEach(async (item: any) => {
    return await prisma.program.create({ data: item })
  });
}

const seedDepartment = async () => {
  departmentData().forEach(async (item: any) => {
    return await prisma.department.create({ data: item })
  });
}

const seedInitClassRoom = async () => {
  classRoomData().forEach(async (item: any) => {
    return await prisma.classroom.create({ data: item })
  });
}

const seedClassName = async () => {
  const className = (await classNameData()).map(async (item: any) => {
    return await prisma.classname.create({
      data: item
    })
  });
  console.log("🚀 ~ file: seed.ts ~ className", className)
}

const seedUsers = async () => {
  const students = (await userStudentData()).map(async (item: any) => {
    return await prisma.user.create({
      data: item
    })
  });
  console.log("🚀 ~ file: seed.ts ~ line 30 ~ students ~ students", students)
}

main()
  .catch((err: any) => console.log(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
