import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Fixes program and department connections, then links students to programs
 */
async function fixProgramConnections() {
  try {
    console.log('=== Starting Program Connection Fix ===\n');

    // 1. Check current state
    console.log('Checking current state...');
    
    const totalPrograms = await prisma.program.count();
    const programsWithoutDepartment = await prisma.program.count({
      where: { departmentId: null }
    });
    
    const totalStudents = await prisma.student.count();
    const studentsWithoutProgram = await prisma.student.count({
      where: { programId: null }
    });
    
    console.log(`Programs without Department: ${programsWithoutDepartment}/${totalPrograms} (${Math.round(programsWithoutDepartment/totalPrograms*100)}%)`);
    console.log(`Students without Program: ${studentsWithoutProgram}/${totalStudents} (${Math.round(studentsWithoutProgram/totalStudents*100)}%)`);

    // 2. Connect programs to departments by name matching
    console.log('\nConnecting programs to departments by name matching...');
    
    // Get all departments
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
      }
    });
    
    // Get all programs without department
    const programsToFix = await prisma.program.findMany({
      where: { departmentId: null },
      select: {
        id: true,
        name: true,
        description: true,
      }
    });
    
    let programDeptFixCount = 0;
    
    // For each program without department, try to find a matching department
    for (const program of programsToFix) {
      let matchedDepartment = null;
      
      // Try direct name match first
      for (const dept of departments) {
        if (program.name && program.name.includes(dept.name)) {
          matchedDepartment = dept;
          break;
        }
      }
      
      // If no match found, try description match
      if (!matchedDepartment && program.description) {
        for (const dept of departments) {
          if (program.description.includes(dept.name)) {
            matchedDepartment = dept;
            break;
          }
        }
      }
      
      // If still no match, try partial matching
      if (!matchedDepartment) {
        for (const dept of departments) {
          // Check if any part of the department name is in the program name
          const deptNameParts = dept.name.split(' ');
          for (const part of deptNameParts) {
            if (part.length > 2 && program.name && program.name.includes(part)) {
              matchedDepartment = dept;
              break;
            }
          }
          if (matchedDepartment) break;
        }
      }
      
      // If we found a match, update the program
      if (matchedDepartment) {
        await prisma.program.update({
          where: { id: program.id },
          data: { departmentId: matchedDepartment.id }
        });
        
        programDeptFixCount++;
        console.log(`Connected program "${program.name || program.id}" to department "${matchedDepartment.name}"`);
      }
    }
    
    console.log(`Connected ${programDeptFixCount} programs to departments`);

    // 3. Connect students to programs based on classroom and department
    console.log('\nConnecting students to programs...');
    
    // Get all students with missing program ID
    const studentsToFix = await prisma.student.findMany({
      where: { programId: null },
      select: {
        id: true,
        levelId: true,
        departmentId: true,
        classroomId: true,
        classroom: {
          select: {
            name: true,
            departmentId: true,
          }
        },
        department: {
          select: {
            id: true,
            name: true,
          }
        },
        level: {
          select: {
            id: true,
            levelName: true,
          }
        }
      }
    });
    
    let studentProgramFixCount = 0;
    
    // For each student, try to find a matching program
    for (const [index, student] of studentsToFix.entries()) {
      if (index % 100 === 0) {
        console.log(`Progress: ${index}/${studentsToFix.length} students processed`);
      }
      
      let matchingProgram = null;
      const studentDeptId = student.departmentId || student.classroom?.departmentId;
      
      // If student has a department, try to find program with matching department and level
      if (studentDeptId && student.levelId) {
        matchingProgram = await prisma.program.findFirst({
          where: {
            AND: [
              { departmentId: studentDeptId },
              { levelId: student.levelId }
            ]
          }
        });
      }
      
      // If no match and student has department, try any program with matching department
      if (!matchingProgram && studentDeptId) {
        matchingProgram = await prisma.program.findFirst({
          where: { departmentId: studentDeptId }
        });
      }
      
      // If still no match and student has classroom, try program by classroom name matching
      if (!matchingProgram && student.classroom?.name) {
        const classroomName = student.classroom.name;
        
        // Get all programs
        const allPrograms = await prisma.program.findMany({
          where: { levelId: student.levelId }
        });
        
        // Try to find a program name that appears in the classroom name
        for (const program of allPrograms) {
          if (program.name && classroomName.includes(program.name)) {
            matchingProgram = program;
            break;
          }
        }
      }
      
      // If still no match, use fallback - find any program with matching level
      if (!matchingProgram && student.levelId) {
        matchingProgram = await prisma.program.findFirst({
          where: { levelId: student.levelId }
        });
      }
      
      // If we found a matching program, update the student
      if (matchingProgram) {
        await prisma.student.update({
          where: { id: student.id },
          data: { programId: matchingProgram.id }
        });
        
        studentProgramFixCount++;
      }
    }
    
    console.log(`Connected ${studentProgramFixCount} students to programs`);

    // 4. Check final state after fixes
    console.log('\nChecking final state after fixes...');
    
    const programsWithoutDepartmentAfter = await prisma.program.count({
      where: { departmentId: null }
    });
    
    const studentsWithoutProgramAfter = await prisma.student.count({
      where: { programId: null }
    });
    
    console.log(`Programs without Department: ${programsWithoutDepartmentAfter}/${totalPrograms} (${Math.round(programsWithoutDepartmentAfter/totalPrograms*100)}%)`);
    console.log(`Students without Program: ${studentsWithoutProgramAfter}/${totalStudents} (${Math.round(studentsWithoutProgramAfter/totalStudents*100)}%)`);
    
    // Calculate improvement
    const programImprovement = programsWithoutDepartment - programsWithoutDepartmentAfter;
    const studentImprovement = studentsWithoutProgram - studentsWithoutProgramAfter;
    
    console.log(`\nImprovement summary:`);
    console.log(`- Fixed program-department connections: ${programImprovement} (${Math.round(programImprovement/programsWithoutDepartment*100)}%)`);
    console.log(`- Fixed student-program connections: ${studentImprovement} (${Math.round(studentImprovement/studentsWithoutProgram*100)}%)`);
    
  } catch (error) {
    console.error('Error fixing program connections:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nFinished fixing program connections.');
  }
}

// Run the fix function
fixProgramConnections();
