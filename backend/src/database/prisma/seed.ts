import { PrismaClient } from '@prisma/client';
import { Classroom } from '../db/classroom';
import { departmentData } from '../db/department';
import { levelData } from '../db/level';
import { createLevelClassroom } from '../db/level-classroom';
import { programData } from '../db/program';
import { userAdmin } from '../db/user-admin';
import { userStudentData } from '../db/user-student';
import { userTeacher } from '../db/user-teacher';

const prisma = new PrismaClient();

const main = async () => {
  console.log('Seeding...');
  // await seedLevels()
  // await seedProgram()
  await seedDepartment()
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

const seedLevels = async () => {
  const level = levelData().forEach(async (item: any) => {
    return await prisma.level.create({ data: item });
  });
  console.log(level);
};

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
  const studentData = await userStudentData('student-hcv-68');
  console.log(`Attempting to create ${studentData.length} student records...`);
  
  let successCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;
  let validationErrorCount = 0;
  
  // Process each student one at a time to better handle errors
  for (const item of studentData) {
    try {
      if (!item) {
        // Skip null items (filtered out during processing)
        continue;
      }
      
      if (!item.username) {
        console.log('Skipping student with missing username');
        errorCount++;
        continue;
      }
      
      // Check if user with this username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: item.username }
      });
      
      if (existingUser) {
        console.log(`User with username ${item.username} already exists, skipping`);
        duplicateCount++;
        continue;
      }
      
      // Create the user with better error handling
      try {
        await prisma.user.create({
          data: item,
        });
        successCount++;
        console.log(`Successfully created user for student ${item.username}`);
      } catch (createError: any) {
        // Handle specific error types differently
        if (createError.code === 'P2002') {
          // This is a unique constraint violation
          console.log(`Duplicate key violation for user ${item.username}: ${createError.meta?.target}`);
          duplicateCount++;
        } else if (createError.name === 'PrismaClientValidationError') {
          // This is a validation error
          console.log(`Validation error for user ${item.username}: ${createError.message}`);
          validationErrorCount++;
        } else {
          // Other errors
          console.log(`Error creating user for student ${item.username}: ${createError.message}`);
          errorCount++;
        }
      }
    } catch (error: any) {
      errorCount++;
      console.log(`Unexpected error processing student: ${error.message || error}`);
    }
  }
  
  console.log(`Student creation completed:`);
  console.log(`- Success: ${successCount}`);
  console.log(`- Duplicates: ${duplicateCount}`);
  console.log(`- Validation Errors: ${validationErrorCount}`);
  console.log(`- Other Errors: ${errorCount}`);
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
