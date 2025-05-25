import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Redistributes students who are all assigned to one classroom
 * to more appropriate classrooms based on their programs and departments
 */
async function redistributeStudents() {
  try {
    console.log('=== Starting Student Classroom Redistribution ===\n');

    // 1. Find the overloaded classroom
    console.log('Identifying classrooms with unusual student counts...');
    
    const classrooms = await prisma.classroom.findMany({
      include: {
        _count: {
          select: { student: true }
        }
      }
    });
    
    // Sort classrooms by student count (descending)
    classrooms.sort((a, b) => b._count.student - a._count.student);
    
    // Display top 5 classrooms by student count
    console.log('\nTop 5 classrooms by student count:');
    for (let i = 0; i < Math.min(5, classrooms.length); i++) {
      const classroom = classrooms[i];
      console.log(`${classroom.name || classroom.classroomId}: ${classroom._count.student} students`);
    }
    
    // Identify the overloaded classroom
    const overloadedClassroom = classrooms[0];
    if (overloadedClassroom._count.student <= 100) {
      console.log('\nNo severely overloaded classrooms found. Largest classroom has only', 
                 overloadedClassroom._count.student, 'students.');
      return;
    }
    
    console.log(`\nOverloaded classroom identified: "${overloadedClassroom.name}" with ${overloadedClassroom._count.student} students`);

    // 2. Get students in the overloaded classroom
    const studentsToRedistribute = await prisma.student.findMany({
      where: { classroomId: overloadedClassroom.id },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            departmentId: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        },
        level: {
          select: {
            id: true,
            levelName: true
          }
        }
      }
    });
    
    console.log(`Found ${studentsToRedistribute.length} students to redistribute`);

    // 3. Group students by program, department, and level
    const studentGroups: Record<string, any[]> = {};
    
    for (const student of studentsToRedistribute) {
      // Create a key for grouping
      const programId = student.programId || 'unknown';
      const departmentId = student.departmentId || 'unknown';
      const levelId = student.levelId || 'unknown';
      const groupKey = `${programId}_${departmentId}_${levelId}`;
      
      // Initialize group if it doesn't exist
      if (!studentGroups[groupKey]) {
        studentGroups[groupKey] = [];
      }
      
      // Add student to group
      studentGroups[groupKey].push(student);
    }
    
    console.log(`Grouped students into ${Object.keys(studentGroups).length} distinct groups`);

    // 4. Find or create target classrooms for each group
    let totalRedistributed = 0;
    
    for (const [groupKey, students] of Object.entries(studentGroups)) {
      if (students.length === 0) continue;
      
      // Use the first student as representative of the group
      const representative = students[0];
      const programId = representative.programId;
      const departmentId = representative.departmentId;
      const levelId = representative.levelId;
      
      console.log(`\nProcessing group with ${students.length} students (Program: ${representative.program?.name || 'unknown'}, Department: ${representative.department?.name || 'unknown'}, Level: ${representative.level?.levelName || 'unknown'})`);
      
      // Try to find an existing classroom for this group
      let targetClassroom = null;
      
      if (programId && departmentId && levelId) {
        // Find classroom with matching program, department and level
        targetClassroom = await prisma.classroom.findFirst({
          where: {
            AND: [
              { programId },
              { departmentId },
              { levelId },
              // Exclude the overloaded classroom
              { id: { not: overloadedClassroom.id } }
            ]
          }
        });
      }
      
      // If no exact match, try with just department and level
      if (!targetClassroom && departmentId && levelId) {
        targetClassroom = await prisma.classroom.findFirst({
          where: {
            AND: [
              { departmentId },
              { levelId },
              // Exclude the overloaded classroom
              { id: { not: overloadedClassroom.id } }
            ]
          }
        });
      }
      
      // If still no match, create a new classroom
      if (!targetClassroom) {
        // Generate classroom name based on available info
        let newClassroomName = '';
        
        if (representative.level?.levelName) {
          newClassroomName += representative.level.levelName;
        }
        
        // Add group number based on number of existing classrooms
        const existingCount = await prisma.classroom.count({
          where: {
            AND: [
              levelId ? { levelId } : {},
              departmentId ? { departmentId } : {}
            ]
          }
        });
        
        // Format as "ปวช.1/X" where X is the next available number
        newClassroomName += `${Math.floor(existingCount / 10) + 1}/${(existingCount % 10) + 1}`;
        
        // Add department name if available
        if (representative.department?.name) {
          newClassroomName += `-${representative.department.name}`;
        }
        
        // Add program-specific qualifier if available (preserving qualifiers like ม.6)
        if (representative.program?.name && 
            representative.program.name.includes('(') && 
            !newClassroomName.includes(representative.program.name)) {
          // Extract the qualifier in parentheses
          const match = representative.program.name.match(/\(([^)]+)\)/);
          if (match) {
            newClassroomName += ` (${match[1]})`;
          }
        }
        
        // Generate unique classroom ID
        const newClassroomId = `CR${Date.now().toString().slice(-8)}`;
        
        console.log(`Creating new classroom: "${newClassroomName}" (${newClassroomId})`);
        
        // Create the new classroom
        targetClassroom = await prisma.classroom.create({
          data: {
            classroomId: newClassroomId,
            name: newClassroomName,
            programId,
            departmentId,
            levelId,
            createdBy: 'script',
            updatedBy: 'script',
            updatedAt: new Date()
          }
        });
      }
      
      // Move students to the target classroom
      if (targetClassroom) {
        console.log(`Moving ${students.length} students to classroom: "${targetClassroom.name || targetClassroom.classroomId}"`);
        
        for (const student of students) {
          await prisma.student.update({
            where: { id: student.id },
            data: { classroomId: targetClassroom.id }
          });
          
          totalRedistributed++;
        }
      }
    }
    
    console.log(`\nRedistributed ${totalRedistributed} students to appropriate classrooms`);

    // 5. Check distribution after changes
    console.log('\nChecking classroom distribution after changes...');
    
    const updatedClassrooms = await prisma.classroom.findMany({
      include: {
        _count: {
          select: { student: true }
        }
      }
    });
    
    // Sort classrooms by student count (descending)
    updatedClassrooms.sort((a, b) => b._count.student - a._count.student);
    
    // Display top 5 classrooms by student count
    console.log('\nTop 5 classrooms by student count after redistribution:');
    for (let i = 0; i < Math.min(5, updatedClassrooms.length); i++) {
      const classroom = updatedClassrooms[i];
      console.log(`${classroom.name || classroom.classroomId}: ${classroom._count.student} students`);
    }
    
    // Calculate improvement
    const initialCount = overloadedClassroom._count.student;
    const currentCount = updatedClassrooms.find(c => c.id === overloadedClassroom.id)?._count.student || 0;
    const reductionPercent = Math.round(((initialCount - currentCount) / initialCount) * 100);
    
    console.log(`\nReduction in overloaded classroom: ${initialCount - currentCount} students (${reductionPercent}% decrease)`);
    
  } catch (error) {
    console.error('Error redistributing students:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nFinished student redistribution.');
  }
}

// Run the redistribution function
redistributeStudents();
