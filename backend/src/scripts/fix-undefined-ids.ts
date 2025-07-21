import { PrismaClient } from '@prisma/client';
import { getProgramId, getClassroomId } from '../utils/utils';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Analyzes and attempts to fix undefined Program IDs and Classroom IDs for students
 */
async function fixUndefinedIds() {
  try {
    console.log('=== Starting Student Reference ID Fix ===\n');

    // 1. Count students with issues before fix
    const totalStudents = await prisma.student.count();

    const studentsWithoutProgramBefore = await prisma.student.count({
      where: { programId: null },
    });

    const studentsWithoutClassroomBefore = await prisma.student.count({
      where: { classroomId: null },
    });

    console.log('Current state:');
    console.log(`Total students: ${totalStudents}`);
    console.log(
      `Students without Program ID: ${studentsWithoutProgramBefore} (${Math.round(
        (studentsWithoutProgramBefore / totalStudents) * 100,
      )}%)`,
    );
    console.log(
      `Students without Classroom ID: ${studentsWithoutClassroomBefore} (${Math.round(
        (studentsWithoutClassroomBefore / totalStudents) * 100,
      )}%)`,
    );

    // 2. Get all students with missing relationships
    console.log('\nFetching students with missing relationship data...');
    const studentsWithIssues = await prisma.student.findMany({
      where: {
        OR: [{ programId: null }, { classroomId: null }],
      },
      select: {
        id: true,
        studentId: true,
        user: {
          select: {
            username: true,
            account: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        levelId: true,
        programId: true,
        classroomId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        level: {
          select: {
            id: true,
            levelName: true,
          },
        },
      },
    });

    console.log(
      `Found ${studentsWithIssues.length} students with missing relationships`,
    );

    // 3. Load essential reference data
    console.log('\nLoading reference data...');

    const fallbackProgram = await prisma.program.findFirst();
    if (!fallbackProgram) {
      console.log('Warning: No fallback program found in database');
    } else {
      console.log(
        `Fallback program will be: ${
          fallbackProgram.name || fallbackProgram.id
        }`,
      );
    }

    const fallbackClassroom = await prisma.classroom.findFirst();
    if (!fallbackClassroom) {
      console.log('Warning: No fallback classroom found in database');
    } else {
      console.log(
        `Fallback classroom will be: ${
          fallbackClassroom.name || fallbackClassroom.id
        }`,
      );
    }

    // 4. Process each student with issues
    console.log('\nProcessing students...');

    let programFixCount = 0;
    let classroomFixCount = 0;

    for (const [index, student] of studentsWithIssues.entries()) {
      if (index % 50 === 0) {
        console.log(
          `Progress: ${index}/${studentsWithIssues.length} students processed`,
        );
      }

      // Display student info
      const studentName = `${student.user?.account?.firstName || ''} ${
        student.user?.account?.lastName || ''
      }`.trim();
      const studentId =
        student.studentId || student.user?.username || 'Unknown';

      // Track if we need to update this student
      let needsUpdate = false;
      const updateData: any = {};

      // Fix missing program ID
      if (!student.programId && student.department) {
        try {
          // Try to find appropriate program using department and level
          const levelName =
            (student.level?.levelName as 'ปวช.' | 'ปวส.') || 'ปวช.';
          const departmentName = student.department.name || '';

          // First try normal lookup
          let programId = await getProgramId(departmentName, levelName, '');

          // If that fails, try to find a program linked to the department
          if (!programId) {
            const departmentProgram = await prisma.program.findFirst({
              where: { departmentId: student.department.id },
            });

            if (departmentProgram) {
              programId = departmentProgram.id;
            } else if (fallbackProgram) {
              // Last resort: use fallback program
              programId = fallbackProgram.id;
            }
          }

          if (programId) {
            updateData.programId = programId;
            needsUpdate = true;
            programFixCount++;
          }
        } catch (error) {
          console.error(
            `Error fixing program for student ${studentId}:`,
            error,
          );
        }
      }

      // Fix missing classroom ID
      if (!student.classroomId) {
        try {
          // Try to find appropriate classroom for the student
          // Check if there's a classroom that matches the department and level
          const classroomMatches =
            student.department && student.level
              ? await prisma.classroom.findFirst({
                  where: {
                    departmentId: student.department.id,
                    levelId: student.level.id,
                  },
                })
              : null;

          let classroomId = classroomMatches?.id;

          // If no match found, use fallback classroom
          if (!classroomId && fallbackClassroom) {
            classroomId = fallbackClassroom.id;
          }

          if (classroomId) {
            updateData.classroomId = classroomId;
            needsUpdate = true;
            classroomFixCount++;
          }
        } catch (error) {
          console.error(
            `Error fixing classroom for student ${studentId}:`,
            error,
          );
        }
      }

      // Update the student if needed
      if (needsUpdate) {
        try {
          await prisma.student.update({
            where: { id: student.id },
            data: updateData,
          });
        } catch (error) {
          console.error(`Error updating student ${studentId}:`, error);
        }
      }
    }

    // 5. Count students with issues after fix
    const studentsWithoutProgramAfter = await prisma.student.count({
      where: { programId: null },
    });

    const studentsWithoutClassroomAfter = await prisma.student.count({
      where: { classroomId: null },
    });

    console.log('\nResults after fix:');
    console.log(
      `Students without Program ID: ${studentsWithoutProgramAfter} (${Math.round(
        (studentsWithoutProgramAfter / totalStudents) * 100,
      )}%)`,
    );
    console.log(
      `Students without Classroom ID: ${studentsWithoutClassroomAfter} (${Math.round(
        (studentsWithoutClassroomAfter / totalStudents) * 100,
      )}%)`,
    );

    console.log(`\nFixed ${programFixCount} missing program references`);
    console.log(`Fixed ${classroomFixCount} missing classroom references`);

    const totalFixed = programFixCount + classroomFixCount;
    const possibleFixes =
      studentsWithoutProgramBefore + studentsWithoutClassroomBefore;

    if (possibleFixes > 0) {
      console.log(
        `Overall fix success rate: ${Math.round(
          (totalFixed / possibleFixes) * 100,
        )}%`,
      );
    }
  } catch (error) {
    console.error('Error fixing undefined IDs:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nFinished fixing undefined IDs.');
  }
}

// Run the fix function
fixUndefinedIds();
