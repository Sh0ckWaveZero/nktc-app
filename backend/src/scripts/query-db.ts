import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Main function to query the database and display results
 */
async function queryDatabase() {
  try {
    console.log('=== NKTC Database Query Tool ===\n');

    // Get counts of primary entities
    console.log('=== Entity Counts ===');
    const levelCount = await prisma.level.count();
    const programCount = await prisma.program.count();
    const departmentCount = await prisma.department.count();
    const levelClassroomCount = await prisma.levelClassroom.count();
    const classroomCount = await prisma.classroom.count();
    const studentCount = await prisma.student.count();

    console.log(`Levels: ${levelCount}`);
    console.log(`Programs: ${programCount}`);
    console.log(`Departments: ${departmentCount}`);
    console.log(`Level Classrooms: ${levelClassroomCount}`);
    console.log(`Classrooms: ${classroomCount}`);
    console.log(`Students: ${studentCount}`);

    // Get Levels
    console.log('\n=== Levels ===');
    const levels = await prisma.level.findMany({
      select: {
        id: true,
        levelId: true,
        levelName: true,
        levelFullName: true,
      },
    });

    levels.forEach((level) => {
      console.log(
        `- ${level.levelName} (${level.levelFullName}), ID: ${level.id}, LevelID: ${level.levelId}`,
      );
    });

    // Get Programs with relationships
    console.log('\n=== Programs with Relationships ===');
    const programs = await prisma.program.findMany({
      select: {
        id: true,
        programId: true,
        name: true,
        description: true,
        level: {
          select: {
            levelName: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
      take: 10, // Limit to 10 for readability
    });

    programs.forEach((program) => {
      console.log(
        `- ${program.name || 'Unnamed'} (${program.programId || 'No ID'})`,
      );
      console.log(`  ID: ${program.id}`);
      console.log(`  Description: ${program.description || 'None'}`);
      console.log(`  Level: ${program.level?.levelName || 'Not connected'}`);
      console.log(
        `  Department: ${program.department?.name || 'Not connected'}`,
      );
      console.log('');
    });

    // Get Departments
    console.log('\n=== Departments ===');
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        departmentId: true,
        name: true,
        description: true,
      },
      take: 10, // Limit to 10 for readability
    });

    departments.forEach((dept) => {
      console.log(
        `- ${dept.name || 'Unnamed'} (${dept.departmentId || 'No ID'})`,
      );
      console.log(`  ID: ${dept.id}`);
      console.log(`  Description: ${dept.description || 'None'}`);
      console.log('');
    });

    // Get Classrooms with all relationships
    console.log('\n=== Classrooms with Relationships ===');
    const classrooms = await prisma.classroom.findMany({
      select: {
        id: true,
        classroomId: true,
        name: true,
        level: {
          select: {
            levelName: true,
          },
        },
        program: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        student: {
          select: {
            id: true,
          },
        },
      },
      take: 10, // Limit to 10 for readability
    });

    classrooms.forEach((classroom) => {
      const studentCount = classroom.student?.length || 0;
      console.log(
        `- ${classroom.name || 'Unnamed'} (${
          classroom.classroomId || 'No ID'
        })`,
      );
      console.log(`  ID: ${classroom.id}`);
      console.log(`  Level: ${classroom.level?.levelName || 'Not connected'}`);
      console.log(`  Program: ${classroom.program?.name || 'Not connected'}`);
      console.log(
        `  Department: ${classroom.department?.name || 'Not connected'}`,
      );
      console.log(`  Student Count: ${studentCount}`);
      console.log('');
    });

    // Get Students with undefined program or classroom
    console.log('\n=== Students with Missing Relationships ===');
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
        program: {
          select: {
            name: true,
          },
        },
        classroom: {
          select: {
            name: true,
          },
        },
        level: {
          select: {
            levelName: true,
          },
        },
      },
      take: 20, // Limit to 20 for readability
    });

    if (studentsWithIssues.length === 0) {
      console.log(
        'No students found with missing program or classroom relationships.',
      );
    } else {
      console.log(
        `Found ${studentsWithIssues.length} students with missing relationships.`,
      );
      studentsWithIssues.forEach((student) => {
        console.log(
          `- ${student.studentId}: ${student.user?.account?.firstName || ''} ${
            student.user?.account?.lastName || ''
          }`,
        );
        console.log(`  Program: ${student.program?.name || 'UNDEFINED'}`);
        console.log(`  Classroom: ${student.classroom?.name || 'UNDEFINED'}`);
        console.log(`  Level: ${student.level?.levelName || 'UNDEFINED'}`);
        console.log('');
      });
    }

    // Count students by program
    console.log('\n=== Student Distribution by Program ===');
    const programsWithStudentCount = await prisma.program.findMany({
      select: {
        name: true,
        _count: {
          select: {
            student: true,
          },
        },
      },
    });

    programsWithStudentCount
      .sort((a, b) => (b._count?.student || 0) - (a._count?.student || 0))
      .slice(0, 10)
      .forEach((prog) => {
        console.log(
          `- ${prog.name || 'Unnamed'}: ${prog._count?.student || 0} students`,
        );
      });

    // Count students by classroom
    console.log('\n=== Student Distribution by Classroom ===');
    const classroomsWithStudentCount = await prisma.classroom.findMany({
      select: {
        name: true,
        _count: {
          select: {
            student: true,
          },
        },
      },
    });

    classroomsWithStudentCount
      .sort((a, b) => (b._count?.student || 0) - (a._count?.student || 0))
      .slice(0, 10)
      .forEach((cr) => {
        console.log(
          `- ${cr.name || 'Unnamed'}: ${cr._count?.student || 0} students`,
        );
      });

    // Check for orphaned data (no relationships)
    console.log('\n=== Orphaned Data Analysis ===');

    const orphanedPrograms = await prisma.program.count({
      where: {
        student: {
          none: {},
        },
      },
    });

    const orphanedClassrooms = await prisma.classroom.count({
      where: {
        student: {
          none: {},
        },
      },
    });

    console.log(
      `Programs with no students: ${orphanedPrograms} of ${programCount}`,
    );
    console.log(
      `Classrooms with no students: ${orphanedClassrooms} of ${classroomCount}`,
    );
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nDatabase connection closed.');
  }
}

// Run the query
queryDatabase();
