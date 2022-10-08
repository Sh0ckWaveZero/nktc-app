
import { PrismaClient } from "@prisma/client";
import { LevelClassroom } from "./db/level-classroom";
import { programData } from "./db/program";
import { levelData } from "./db/level";
import { userStudentData } from "./db/user-student";
import { departmentData } from './db/department';
import { Classroom } from './db/classroom';
import { userTeacher } from './db/user-teacher';
import { userAdmin } from './db/user-admin';



const prisma = new PrismaClient();

const main = async () => {

  console.log("Seeding...");
  // seedLevels()
  // seedProgram()
  // await seedDepartment()
  // await seedLevelClassroom()
  // await seedClassroom()
  // await seedStudents()
    // seedTeacher()
    seedAdmin()
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
  const program = (await programData()).forEach(async (item: any) => {
    return await prisma.program.create({ data: item })
  });
  console.log(program);
}

const seedDepartment = async () => {
  const result = (await departmentData()).forEach(async (item: any) => {
    return await prisma.department.create({ data: item })
  });
  console.log(result);
}

const seedLevelClassroom = async () => {
  const levelClassroom = (await LevelClassroom()).forEach(async (item: any) => {
    return await prisma.levelClassroom.create({ data: item })
  });
  console.log(levelClassroom);
}

const seedClassroom = async () => {
  const classroom = (await Classroom()).forEach(async (item: any) => {
    return await prisma.classroom.create({ data: item })
  });
  console.log(classroom);
}

const seedStudents = async () => {
  const students = (await userStudentData('student-hcv-2')).map(async (item: any) => {
    return await prisma.user.create({
      data: item
    })
  });
}

const seedTeacher = async () => {
  const seedTeacher = (await userTeacher('user-teacher')).map(async (item: any) => {
    return await prisma.user.create({
      data: item
    })
  });
}

const seedAdmin = async () => {
  const admin = await userAdmin()
  const result = await prisma.user.create({
    data: admin
  })
}

main()
  .catch((err: any) => console.log(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
