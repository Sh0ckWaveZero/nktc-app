import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Fix remaining programs without department connections using
 * advanced matching techniques
 */
async function fixRemainingProgramConnections() {
  try {
    console.log('=== Starting Fix for Remaining Program-Department Connections ===\n');

    // 1. Check current state
    console.log('Checking current status of program-department connections...');
    
    const totalPrograms = await prisma.program.count();
    const programsWithoutDepartment = await prisma.program.findMany({
      where: { departmentId: null },
      select: {
        id: true,
        programId: true,
        name: true,
        description: true
      }
    });
    
    console.log(`Found ${programsWithoutDepartment.length} of ${totalPrograms} programs without department connections`);

    if (programsWithoutDepartment.length === 0) {
      console.log('All programs are already connected to departments. Nothing to do!');
      return;
    }

    // 2. Get all departments for matching
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        departmentId: true,
        name: true,
        description: true,
      }
    });
    
    console.log(`Found ${departments.length} departments for matching`);

    // 3. For each unconnected program, try advanced text matching
    let fixCount = 0;
    let manualMappings: Record<string, string> = {};
    
    // 3.1 First try advanced text matching
    for (const program of programsWithoutDepartment) {
      console.log(`\nAttempting to match program: "${program.name || program.programId}"`);
      
      // Try manual mapping based on common patterns but preserve the full program names
      // These mappings maintain the complete program name including qualifiers like (ม.6)
      if (program.name && program.name.includes('เทคนิคยานยนต์')) {
        manualMappings[program.id] = departments.find(d => d.name && d.name.includes('ช่างยนต์'))?.id;
      } else if (program.name && program.name.includes('ไฟฟ้า')) {
        manualMappings[program.id] = departments.find(d => d.name && d.name.includes('ไฟฟ้า'))?.id;
      } else if (program.name && program.name.includes('เทคโนโลยีอิเล็กทรอนิกส์ (ม.6)')) {
        // Specific mapping for เทคโนโลยีอิเล็กทรอนิกส์ (ม.6) that preserves the full name
        manualMappings[program.id] = departments.find(d => d.name && d.name.includes('อิเล็กทรอนิกส์'))?.id;
      } else if (program.name && program.name.includes('อิเล็กทรอนิกส์')) {
        manualMappings[program.id] = departments.find(d => d.name && d.name.includes('อิเล็กทรอนิกส์'))?.id;
      }
      
      // If we found a manual mapping, continue to the next program
      if (manualMappings[program.id]) {
        console.log(`  Found manual mapping to department: "${departments.find(d => d.id === manualMappings[program.id])?.name}"`);
        continue;
      }

      // Try fuzzy text matching by tokenizing names
      let bestMatch = null;
      let bestScore = 0;
      
      const programWords = [
        ...(program.name ? program.name.toLowerCase().split(/\s+/) : []),
        ...(program.description ? program.description.toLowerCase().split(/\s+/) : [])
      ];
      
      for (const dept of departments) {
        const deptWords = [
          ...(dept.name ? dept.name.toLowerCase().split(/\s+/) : []),
          ...(dept.description ? dept.description.toLowerCase().split(/\s+/) : [])
        ];
        
        // Calculate match score based on word overlap
        let score = 0;
        for (const word of programWords) {
          if (word.length < 3) continue; // Skip short words
          
          for (const deptWord of deptWords) {
            if (deptWord.length < 3) continue; // Skip short words
            
            if (word === deptWord) {
              score += 2; // Exact match
            } else if (word.includes(deptWord) || deptWord.includes(word)) {
              score += 1; // Partial match
            }
          }
        }
        
        // If this is the best match so far, store it
        if (score > bestScore) {
          bestScore = score;
          bestMatch = dept;
        }
      }
      
      // If we found a decent match, store it
      if (bestScore >= 2 && bestMatch) {
        manualMappings[program.id] = bestMatch.id;
        console.log(`  Found fuzzy text match to department: "${bestMatch.name}" (score: ${bestScore})`);
      } else {
        console.log(`  No good match found for this program`);
      }
    }
    
    // 3.2 Connect students to their departments and infer program-department relationships
    if (Object.keys(manualMappings).length < programsWithoutDepartment.length) {
      console.log('\nAttempting to infer program-department connections from student data...');
      
      // Get programs that are still unmatched
      const stillUnmatchedPrograms = programsWithoutDepartment.filter(
        p => !manualMappings[p.id]
      );
      
      for (const program of stillUnmatchedPrograms) {
        // Find students with this program
        const studentsWithThisProgram = await prisma.student.findMany({
          where: { programId: program.id },
          select: {
            departmentId: true
          }
        });
        
        if (studentsWithThisProgram.length > 0) {
          // Count department occurrences
          const deptCounts: Record<string, number> = {};
          
          for (const student of studentsWithThisProgram) {
            if (student.departmentId) {
              deptCounts[student.departmentId] = (deptCounts[student.departmentId] || 0) + 1;
            }
          }
          
          // Find most common department
          let maxCount = 0;
          let mostCommonDeptId = null;
          
          for (const [deptId, count] of Object.entries(deptCounts)) {
            if (count > maxCount) {
              maxCount = count;
              mostCommonDeptId = deptId;
            }
          }
          
          // If we found a common department among students, use it
          if (mostCommonDeptId) {
            manualMappings[program.id] = mostCommonDeptId;
            const deptName = departments.find(d => d.id === mostCommonDeptId)?.name;
            console.log(`  Inferred department "${deptName}" for program "${program.name}" from ${maxCount} students`);
          }
        }
      }
    }
    
    // 4. Apply the mappings we've found
    console.log('\nApplying department mappings to programs...');
    
    for (const [programId, departmentId] of Object.entries(manualMappings)) {
      try {
        await prisma.program.update({
          where: { id: programId },
          data: { departmentId }
        });
        
        fixCount++;
        
        // Get program and department names for logging
        const program = programsWithoutDepartment.find(p => p.id === programId);
        const department = departments.find(d => d.id === departmentId);
        
        console.log(`Connected program "${program?.name || programId}" to department "${department?.name || departmentId}"`);
      } catch (error) {
        console.error(`Error connecting program ${programId} to department ${departmentId}:`, error);
      }
    }
    
    // 5. Check final state after fixes
    console.log('\nChecking final state after fixes...');
    
    const programsWithoutDepartmentAfter = await prisma.program.count({
      where: { departmentId: null }
    });
    
    console.log(`Programs without Department: ${programsWithoutDepartmentAfter}/${totalPrograms} (${Math.round(programsWithoutDepartmentAfter/totalPrograms*100)}%)`);
    
    // Calculate improvement
    const improvement = programsWithoutDepartment.length - programsWithoutDepartmentAfter;
    
    console.log(`\nImprovement summary:`);
    console.log(`- Fixed program-department connections: ${improvement} of ${programsWithoutDepartment.length} (${Math.round(improvement/programsWithoutDepartment.length*100)}%)`);
    
  } catch (error) {
    console.error('Error fixing program connections:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nFinished fixing remaining program-department connections.');
  }
}

// Run the fix function
fixRemainingProgramConnections();
