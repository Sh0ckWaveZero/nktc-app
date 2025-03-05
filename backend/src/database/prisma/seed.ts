import { PrismaClient } from '@prisma/client';
import { Classroom } from '../db/classroom';
import { departmentData } from '../db/department';
import { levelData, seedLevels } from '../db/level'; // Import the updated function
import { createLevelClassroom } from '../db/level-classroom';
import { programData } from '../db/program';
import { userAdmin } from '../db/user-admin';
import { userStudentData } from '../db/user-student';
import { userTeacher } from '../db/user-teacher';

const prisma = new PrismaClient();

const main = async () => {
  console.log('Seeding...');
  // await seedLevels() // Using the fixed seedLevels function
  await seedProgram()
  // await seedDepartment()
  // await seedLevelClassroom()
  // await seedClassroom()
  // await seedStudents()   
    // await seedTeacher()
    // await seedAdmin()
    .then(() => {
      console.log('Seeding complete 🎉');
    })
    .catch((err) => {
      console.log('Seeding failed 😭', err);
    });
};

// Remove the old seedLevels function since we've moved it to level.ts
// const seedLevels = async () => {
//   const level = levelData().forEach(async (item: any) => {
//     return await prisma.level.create({ data: item });
//   });
//   console.log(level);
// };

const seedProgram = async () => {
  const data = await programData();
  console.log('🚀 ~ file: seed.ts:42 ~ seedProgram ~ data:', data);
};

const seedDepartment = async () => {
  const result = (await departmentData()).forEach(async (item: any) => {
    return await prisma.department.create({ data: item });
  });
  console.log(result);
};

const seedLevelClassroom = async () => {
  const levelClassroom = await createLevelClassroom();
  console.log(levelClassroom);
};

const seedClassroom = async () => {
  const classroom = await Classroom();
  console.log(classroom);
};

const seedStudents = async () => {
  try {
    const students = (await userStudentData('67_อิเล็กทรอนิกส์')).map(
      async (item: any) => {
        return await prisma.user.create({
          data: item,
        });
      },
    )
    console.log(students);
  }
  catch (err) {
    console.log(err)
  }
};

const seedTeacher = async () => {
  const seedTeacher = (await userTeacher('user-teacher')).map(
    async (item: any) => {
      return await prisma.user.create({
        data: item,
      });
    },
  );
};

const seedAdmin = async () => {
  const admin = await userAdmin();
  const result = await prisma.user.create({
    data: admin,
  });
};

main()
  .catch((err: any) => console.log(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
