import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import {
  createByAdmin,
  getBirthday,
  readWorkSheetFromFile,
} from '../utils/utils';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Enhanced student import function with proper sequencing and relationship handling
 * @param fileName The Excel file name to import student data from
 */
export async function enhancedImportStudents(fileName: string) {
  console.log(`=== Starting Enhanced Student Import from ${fileName} ===\n`);

  try {
    // Map to store unique student IDs and track duplicates
    const uniqueStudentIds = new Map();
    const workSheetsFromFile = readWorkSheetFromFile(fileName);
    const admin = createByAdmin();

    // First pass to identify duplicate student IDs
    console.log('Scanning for duplicate student IDs...');
    workSheetsFromFile[0].data
      .filter((data: any, id: number) => id > 1 && data)
      .forEach((item: any) => {
        const studentId = item[1]?.toString(); // ตรงนี้อาจต้องปรับตาม index ที่ถูกต้อง
        if (studentId) {
          if (uniqueStudentIds.has(studentId)) {
            uniqueStudentIds.set(
              studentId,
              uniqueStudentIds.get(studentId) + 1,
            );
          } else {
            uniqueStudentIds.set(studentId, 1);
          }
        }
      });

    // Report on duplicates
    let duplicateCount = 0;
    uniqueStudentIds.forEach((count, id) => {
      if (count > 1) {
        duplicateCount++;
        console.log(`Duplicate student ID: ${id} (appears ${count} times)`);
      }
    });

    if (duplicateCount > 0) {
      console.log(`Found ${duplicateCount} duplicate student IDs`);
    } else {
      console.log('No duplicate student IDs found');
    }

    // Prepare student data
    console.log('\nPreparing student data...');
    const studentData = [];

    for (const item of workSheetsFromFile[0].data.filter(
      (data: any, id: number) => id > 1 && data,
    )) {
      try {
        // ดึงข้อมูลหลักตาม index เดิม
        const [
          idCard, // 0
          studentId, // 1
          classroomName, // 2
          title, // 3
          firstName, // 4
          lastName, // 5
          major, // 6
          departmentName, // 7
          programName, // 8
          levelName, // 9
          plan, // 10
          // ...อาจมีคอลัมน์อื่น ๆ...
        ] = item;

        // ดึงประเภทนักเรียนจากคอลัมน์สุดท้ายเสมอ
        const studentType = item[item.length - 1];

        // เพิ่ม console.log เพื่อตรวจสอบข้อมูลนักเรียน
        console.log(`\nProcessing student: ${studentId || 'NO_ID'}`);
        console.log(
          `  Name: ${title || ''} ${firstName || ''} ${lastName || ''}`,
        );
        console.log(`  Classroom: ${classroomName || 'NOT_SPECIFIED'}`);
        console.log(`  Program: ${programName || 'NOT_SPECIFIED'}`);
        console.log(`  Department: ${departmentName || 'NOT_SPECIFIED'}`);
        console.log(`  Level: ${levelName || 'NOT_SPECIFIED'}`);

        // Skip record if essential data is missing
        if (!studentId || !firstName) {
          console.log(
            `⚠️ Skipping record with missing essential data: ${item}`,
          );
          continue;
        }

        // 1. Pre-resolve all IDs to ensure proper sequencing

        // Step 1.1: Find or resolve level
        const level = levelName ? await findOrCreateLevel(levelName) : null;
        if (!level) {
          console.log(
            `⚠️ Warning: Could not find or create level for ${levelName}`,
          );
        }

        // Step 1.2: Find or resolve department
        let department = null;
        if (departmentName) {
          department = await findOrCreateDepartment(departmentName);
          if (!department) {
            console.log(
              `⚠️ Warning: Could not find or create department for ${departmentName}`,
            );
          }
        }

        // Step 1.3: Find or resolve program
        let program = null;
        if (programName && level) {
          program = await findOrCreateProgram(
            programName,
            level.id,
            department?.id,
          );
          if (!program) {
            console.log(
              `⚠️ Warning: Could not find or create program for ${programName}`,
            );
          } else {
            console.log(
              `  Program ID: ${program.id}, Program Name: ${program.name}`,
            );
          }
        }

        // Step 1.4: Find or resolve classroom
        let classroom = null;
        if (classroomName) {
          classroom = await findOrCreateClassroom(
            classroomName,
            level?.id,
            program?.id,
            department?.id,
          );
          if (!classroom) {
            console.log(
              `⚠️ Warning: Could not find or create classroom for ${classroomName}`,
            );
          } else {
            console.log(
              `  Classroom ID: ${classroom.id}, Classroom Name: ${classroom.name}`,
            );
          }
        } else {
          console.log(
            `⚠️ No classroom name specified for student ${studentId}`,
          );
        }

        // 2. Create student object with all relationships properly set
        const username = studentId.toString();
        const password = await hash(idCard || studentId.toString(), 12);

        // Build the student object
        const studentObject = {
          username: studentId.toString(),
          password: await hash(idCard || studentId.toString(), 12),
          role: 'Student',
          account: {
            create: {
              title: title?.toString() || '',
              firstName: firstName?.toString() || '',
              lastName: lastName?.toString() || '',
              idCard: idCard?.toString() || '',
              // birthDate: parsedBirthday, // ถ้ามีวันเกิด
              ...admin,
            },
          },
          student: {
            create: {
              studentId: studentId.toString(),
              status: 'normal',
              studentType: studentType?.toString() || 'ปกติ',
              ...(classroom && { classroomId: classroom.id }),
              ...(department && { departmentId: department.id }),
              ...(program && { programId: program.id }),
              ...(level && { levelId: level.id }),
              ...admin,
            },
          },
          ...admin,
        };

        // เพิ่ม console.log เพื่อตรวจสอบข้อมูลที่จะบันทึก
        console.log(`  Student relationships:
          - Classroom ID: ${classroom?.id || 'undefined'} 
          - Department ID: ${department?.id || 'undefined'}
          - Program ID: ${program?.id || 'undefined'}
          - Level ID: ${level?.id || 'undefined'}`);

        studentData.push(studentObject);
      } catch (error) {
        console.error(`⚠️ Error processing student: ${error.message}`);
      }
    }

    // 3. Create the students in the database
    console.log(`\nImporting ${studentData.length} students to database...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < studentData.length; i++) {
      try {
        const student = studentData[i];

        // Check if student already exists
        const existingStudent = await prisma.user.findUnique({
          where: { username: student.username },
        });

        if (existingStudent) {
          console.log(
            `Student ${student.username} already exists, skipping...`,
          );
          continue;
        }

        // Create the student
        const createdUser = await prisma.user.create({
          data: student,
        });

        successCount++;
        console.log(
          `✅ Created student: ${student.username} (ID: ${createdUser.id})`,
        );

        // Log progress periodically
        if (successCount % 50 === 0) {
          console.log(`Progress: Created ${successCount} students`);
        }
      } catch (error) {
        console.error(
          `⚠️ Error creating student #${i + 1} (${studentData[i]?.username}): ${
            error.message
          }`,
        );
        errorCount++;
      }
    }

    // 4. Report results
    console.log(`\nStudent import completed:`);
    console.log(`- Successfully imported: ${successCount} students`);
    console.log(`- Failed to import: ${errorCount} students`);
    console.log(`- Total processed: ${studentData.length} students`);

    return {
      totalProcessed: studentData.length,
      success: successCount,
      error: errorCount,
    };
  } catch (error) {
    console.error('Error importing students:', error);
    throw error;
  }
}

/**
 * Find an existing level or create a new one if it doesn't exist
 */
async function findOrCreateLevel(levelName: string) {
  // Standardize level name
  let standardLevelName = levelName.toString().trim();
  if (standardLevelName.includes('ปวช')) {
    standardLevelName = 'ปวช.';
  } else if (standardLevelName.includes('ปวส')) {
    standardLevelName = 'ปวส.';
  }

  // Find existing level
  let level = await prisma.level.findFirst({
    where: {
      levelName: standardLevelName,
    },
  });

  // If level doesn't exist, create it
  if (!level) {
    const levelFullName =
      standardLevelName === 'ปวช.'
        ? 'ประกาศนียบัตรวิชาชีพ'
        : 'ประกาศนียบัตรวิชาชีพชั้นสูง';

    const levelId = standardLevelName === 'ปวช.' ? 'L001' : 'L002';

    level = await prisma.level.create({
      data: {
        levelId,
        levelName: standardLevelName,
        levelFullName,
        ...createByAdmin(),
      },
    });

    console.log(`Created new level: ${standardLevelName}`);
  }

  return level;
}

/**
 * Find an existing department or create a new one if it doesn't exist
 */
async function findOrCreateDepartment(departmentName: string) {
  if (!departmentName) return null;

  // Standardize department name
  const standardName = departmentName.toString().trim();

  // Find existing department
  let department = await prisma.department.findFirst({
    where: {
      name: standardName,
    },
  });

  // If department doesn't exist, create it
  if (!department) {
    // Generate a unique department ID
    const departmentCount = await prisma.department.count();
    const departmentId = `D${(departmentCount + 1)
      .toString()
      .padStart(3, '0')}`;

    department = await prisma.department.create({
      data: {
        departmentId,
        name: standardName,
        description: standardName,
        ...createByAdmin(),
      },
    });

    console.log(`Created new department: ${standardName}`);
  }

  return department;
}

/**
 * Find an existing program or create a new one if it doesn't exist
 * Supports matching with variants like (ทวิภาคี), (ม.6), etc.
 */
async function findOrCreateProgram(
  programName: string,
  levelId: string,
  departmentId?: string,
) {
  if (!programName) return null;

  // Standardize program name but preserve full name including qualifiers like (ม.6)
  const standardName = programName.toString().trim();

  console.log(
    `Finding program with name: ${standardName}, levelId: ${levelId}`,
  );

  // First try exact match
  let program = await prisma.program.findFirst({
    where: {
      name: standardName,
      levelId,
    },
  });

  // If not found, try finding similar programs with different qualifiers
  if (!program) {
    console.log(
      `No exact match for program ${standardName}, trying with base name...`,
    );

    // Extract base program name without qualifiers
    const baseName = standardName.replace(/\s*\([^)]*\)\s*$/g, '').trim();
    console.log(`Looking for programs starting with base name: ${baseName}`);

    // Try to find program with same base name but different qualifier
    program = await prisma.program.findFirst({
      where: {
        name: {
          startsWith: baseName,
        },
        levelId,
      },
    });

    if (program) {
      console.log(`Found similar program: ${program.name} for ${standardName}`);
    }

    // Special case for "ทวิภาคี" if we still haven't found a match
    if (!program && standardName.includes('ทวิภาคี')) {
      console.log(`Looking for ทวิภาคี program variant for ${standardName}...`);

      // Check if we have the non-ทวิภาคี version first
      const normalName = standardName.replace(/\s*\(ทวิภาคี\)\s*$/g, '').trim();
      program = await prisma.program.findFirst({
        where: {
          name: normalName,
          levelId,
        },
      });

      if (program) {
        console.log(
          `Found regular program ${program.name} for ทวิภาคี version ${standardName}`,
        );
        // Now create the ทวิภาคี variant based on the found program
        const programCount = await prisma.program.count();
        const programId = `P${(programCount + 1).toString().padStart(3, '0')}`;

        const existingProgramData = program;
        program = await prisma.program.create({
          data: {
            programId,
            name: standardName,
            description: standardName,
            levelId,
            departmentId: existingProgramData.departmentId || departmentId,
            ...createByAdmin(),
          },
        });

        console.log(
          `Created new ทวิภาคี program: ${standardName} based on ${existingProgramData.name}`,
        );
      }

      // Check if we have the ทวิภาคี version but looking for the normal version
      if (!program && !standardName.endsWith('(ทวิภาคี)')) {
        const twiName = `${standardName} (ทวิภาคี)`;
        program = await prisma.program.findFirst({
          where: {
            name: twiName,
            levelId,
          },
        });

        if (program) {
          console.log(
            `Found ทวิภาคี program ${program.name} for regular version ${standardName}`,
          );
        }
      }
    }
  }

  // If still not found, create it
  if (!program) {
    // Generate a unique program ID
    const programCount = await prisma.program.count();
    const programId = `P${(programCount + 1).toString().padStart(3, '0')}`;

    program = await prisma.program.create({
      data: {
        programId,
        name: standardName,
        description: standardName,
        levelId,
        ...(departmentId && { departmentId }),
        ...createByAdmin(),
      },
    });

    console.log(`Created new program: ${standardName}`);
  } else if (!program.departmentId && departmentId) {
    // Update program with department ID if it's missing
    program = await prisma.program.update({
      where: { id: program.id },
      data: { departmentId },
    });

    console.log(
      `Updated program ${standardName} with department ID ${departmentId}`,
    );
  }

  return program;
}

/**
 * Find an existing classroom or create a new one if it doesn't exist
 */
async function findOrCreateClassroom(
  classroomName: string,
  levelId?: string,
  programId?: string,
  departmentId?: string,
) {
  if (!classroomName) return null;

  // Standardize classroom name
  const standardName = classroomName.toString().trim();

  // Find existing classroom
  let classroom = await prisma.classroom.findFirst({
    where: {
      name: standardName,
    },
  });

  // If classroom doesn't exist, create it
  if (!classroom) {
    // Generate a unique classroom ID
    const classroomCount = await prisma.classroom.count();
    const classroomId = `CR${(classroomCount + 1).toString().padStart(3, '0')}`;

    classroom = await prisma.classroom.create({
      data: {
        classroomId,
        name: standardName,
        ...(levelId && { levelId }),
        ...(programId && { programId }),
        ...(departmentId && { departmentId }),
        ...createByAdmin(),
      },
    });

    console.log(`Created new classroom: ${standardName}`);
  } else {
    // Update classroom with missing IDs if available or correct existing ones
    const updateData: any = {};

    // Correct levelId if new one is provided and different from existing
    if (levelId && classroom.levelId !== levelId) {
      updateData.levelId = levelId;
      console.log(
        `Classroom ${standardName} (ID: ${classroom.id}): Correcting levelId from ${classroom.levelId} to ${levelId}`,
      );
    }

    // Correct programId if new one is provided and different from existing
    if (programId && classroom.programId !== programId) {
      updateData.programId = programId;
      console.log(
        `Classroom ${standardName} (ID: ${classroom.id}): Correcting programId from ${classroom.programId} to ${programId}`,
      );
    }

    // Add departmentId if missing and new one is provided (original conservative logic)
    if (departmentId && !classroom.departmentId) {
      updateData.departmentId = departmentId;
      console.log(
        `Classroom ${standardName} (ID: ${classroom.id}): Adding departmentId ${departmentId}`,
      );
    }

    // Only update if there are fields to update
    if (Object.keys(updateData).length > 0) {
      classroom = await prisma.classroom.update({
        where: { id: classroom.id },
        data: updateData,
      });

      console.log(
        `Updated classroom ${standardName} with new/corrected/added IDs`,
      );
    }
  }

  return classroom;
}

// If this file is run directly, import students from the default file
if (require.main === module) {
  enhancedImportStudents('student-hcv-68')
    .then(() => {
      console.log('Student import completed.');
      prisma.$disconnect();
    })
    .catch((error) => {
      console.error('Student import failed:', error);
      prisma.$disconnect();
    });
}
