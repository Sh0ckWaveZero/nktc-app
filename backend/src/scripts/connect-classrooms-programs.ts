import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Connect classrooms to programs in the database
 */
async function connectClassroomsToPrograms() {
  try {
    console.log('=== Starting Classroom-Program Connection Fix ===\n');

    // 1. Check current state
    console.log('Checking current classroom-program connections...');
    
    const totalClassrooms = await prisma.classroom.count();
    const classroomsWithoutProgram = await prisma.classroom.count({
      where: { programId: null }
    });
    
    console.log(`Classrooms without Program: ${classroomsWithoutProgram}/${totalClassrooms} (${Math.round(classroomsWithoutProgram/totalClassrooms*100)}%)`);

    if (classroomsWithoutProgram === 0) {
      console.log('All classrooms are already connected to programs. Nothing to do!');
      return;
    }

    // 2. Get all classrooms without programs
    const classroomsToFix = await prisma.classroom.findMany({
      where: { programId: null },
      include: {
        department: true,
        level: true,
        student: {
          select: {
            programId: true
          },
          take: 100 // Limit to avoid retrieving too much data
        }
      }
    });
    
    console.log(`Found ${classroomsToFix.length} classrooms without program connections`);

    // 3. Get all programs for matching
    const programs = await prisma.program.findMany();
    console.log(`Found ${programs.length} programs for matching`);

    // 4. Connect classrooms to programs
    let fixCount = 0;
    
    for (const classroom of classroomsToFix) {
      console.log(`\nProcessing classroom: "${classroom.name || classroom.classroomId}"`);
      
      let matchingProgramId = null;
      
      // Strategy 1: Check if classroom has students with programs
      if (classroom.student.length > 0) {
        // Count occurrences of each program
        const programCounts: Record<string, number> = {};
        
        for (const student of classroom.student) {
          if (student.programId) {
            programCounts[student.programId] = (programCounts[student.programId] || 0) + 1;
          }
        }
        
        // Find the most common program
        let mostCommonProgram = null;
        let maxCount = 0;
        
        for (const [programId, count] of Object.entries(programCounts)) {
          if (count > maxCount) {
            maxCount = count;
            mostCommonProgram = programId;
          }
        }
        
        if (mostCommonProgram) {
          matchingProgramId = mostCommonProgram;
          const programName = programs.find(p => p.id === mostCommonProgram)?.name || 'Unknown';
          console.log(`  Found matching program "${programName}" from student data (${maxCount} students)`);
        }
      }
      
      // Strategy 2: If no match from students, match by name pattern
      if (!matchingProgramId && classroom.name) {
        // Extract potential program name from classroom name (after the dash)
        const nameParts = classroom.name.split('-');
        if (nameParts.length > 1) {
          const potentialProgramName = nameParts[1].trim();
          
          // Extract qualifier if it exists (like "ม.6")
          let qualifier = '';
          if (classroom.name.includes('(') && classroom.name.includes(')')) {
            const qualifierMatch = classroom.name.match(/\(([^)]+)\)/);
            if (qualifierMatch) {
              qualifier = qualifierMatch[1];
            }
          }
          
          // Find programs with similar names
          for (const program of programs) {
            // Check for exact match with qualifier first
            if (qualifier && program.name && program.name.includes(`(${qualifier})`)) {
              if (program.name.includes(potentialProgramName) || 
                  potentialProgramName.includes(program.name.replace(`(${qualifier})`, '').trim())) {
                matchingProgramId = program.id;
                console.log(`  Matched program "${program.name}" by classroom name with qualifier (${qualifier})`);
                break;
              }
            } 
            // If no qualifier match or no qualifier exists, try regular matching
            else if (program.name && 
                (program.name.includes(potentialProgramName) || 
                 potentialProgramName.includes(program.name))) {
              matchingProgramId = program.id;
              console.log(`  Matched program "${program.name}" by classroom name pattern`);
              break;
            }
          }
        }
      }
      
      // Strategy 3: Match by department and level
      if (!matchingProgramId && classroom.departmentId && classroom.levelId) {
        // Find a program with the same department and level
        const departmentProgram = await prisma.program.findFirst({
          where: {
            AND: [
              { departmentId: classroom.departmentId },
              { levelId: classroom.levelId }
            ]
          }
        });
        
        if (departmentProgram) {
          matchingProgramId = departmentProgram.id;
          console.log(`  Matched program "${departmentProgram.name}" by department and level`);
        } else {
          // Try with just department if both department and level matching failed
          const deptOnlyProgram = await prisma.program.findFirst({
            where: { departmentId: classroom.departmentId }
          });
          
          if (deptOnlyProgram) {
            matchingProgramId = deptOnlyProgram.id;
            console.log(`  Matched program "${deptOnlyProgram.name}" by department only`);
          }
        }
      }
      
      // If we found a match, update the classroom
      if (matchingProgramId) {
        try {
          await prisma.classroom.update({
            where: { id: classroom.id },
            data: { programId: matchingProgramId }
          });
          
          fixCount++;
        } catch (error) {
          console.error(`  Error updating classroom:`, error);
        }
      } else {
        console.log(`  No matching program found for this classroom`);
      }
    }
    
    // 5. Check final state after fixes
    console.log('\nChecking final state after fixes...');
    
    const classroomsWithoutProgramAfter = await prisma.classroom.count({
      where: { programId: null }
    });
    
    console.log(`Classrooms without Program: ${classroomsWithoutProgramAfter}/${totalClassrooms} (${Math.round(classroomsWithoutProgramAfter/totalClassrooms*100)}%)`);
    
    // Calculate improvement
    const fixPercent = Math.round((fixCount / classroomsWithoutProgram) * 100);
    
    console.log(`\nImprovement summary:`);
    console.log(`- Connected ${fixCount} of ${classroomsWithoutProgram} classrooms to programs (${fixPercent}%)`);
    
  } catch (error) {
    console.error('Error connecting classrooms to programs:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nFinished connecting classrooms to programs.');
  }
}

// Run the connection function
connectClassroomsToPrograms();
