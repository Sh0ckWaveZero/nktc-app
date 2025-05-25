import { PrismaClient } from '@prisma/client';
import { getProgramId, getClassroomId } from '../utils/utils';
import fs from 'fs';
import xlsx from 'node-xlsx';
import path from 'path';

// Initialize Prisma client
const prisma = new PrismaClient();

// Utility function to read Excel file
const readExcelFile = (fileName: string) => {
  try {
    // Try with direct file path first
    const excelPath = `${process.cwd()}/src/database/db/nktc-services/db/import/${fileName}.xlsx`;
    
    if (!fs.existsSync(excelPath)) {
      console.error(`Excel file not found: ${excelPath}`);
      return null;
    }
    
    return xlsx.parse(fs.readFileSync(excelPath));
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return null;
  }
};

/**
 * Tests the program ID and classroom ID lookup functions for students
 */
async function testLookupFunctions() {
  try {
    console.log('=== Testing Program ID and Classroom ID Lookup Functions ===\n');

    // Read the student Excel file
    const studentWorksheets = readExcelFile('student-hcv-68');
    if (!studentWorksheets || studentWorksheets.length === 0) {
      console.error('Could not read student Excel file');
      return;
    }

    // Process a sample of students
    const sampleSize = 5;
    const studentData = studentWorksheets[0].data
      .filter((data: any, id: number) => id > 1 && data)
      .slice(0, sampleSize);
      
    console.log(`Testing lookup functions with ${sampleSize} sample students...\n`);

    for (const [index, student] of studentData.entries()) {
      // Extract student info from Excel
      const studentId = student[2]?.toString();
      const title = student[3]?.toString() || '';
      const firstName = student[4]?.toString() || '';
      const lastName = student[5]?.toString() || '';
      const levelClassroom = student[7]?.toString() || ''; // e.g., ปวช.1/1
      const departmentName = student[8]?.toString() || '';
      const programName = student[9]?.toString() || '';
      const group = student[10]?.toString() || '';
      
      // Determine level name (ปวช. or ปวส.)
      let levelName: 'ปวช.' | 'ปวส.' = 'ปวช.';
      if (levelClassroom && levelClassroom.includes('ปวส')) {
        levelName = 'ปวส.';
      }

      console.log(`\n=== Student ${index + 1}: ${studentId} - ${firstName} ${lastName} ===`);
      console.log(`Level: ${levelName}`);
      console.log(`Level Classroom: ${levelClassroom}`);
      console.log(`Department: ${departmentName}`);
      console.log(`Program: ${programName}`);
      console.log(`Group: ${group}`);

      // Test program lookup
      console.log('\nTESTING PROGRAM ID LOOKUP:');
      try {
        // Test with modified parameters to trace the issue
        console.log('Test 1: Standard parameters');
        const programId1 = await getProgramId(departmentName, levelName, programName);
        console.log(`Result: ${programId1 || 'undefined'}`);
        
        console.log('Test 2: Using department name with empty program name');
        const programId2 = await getProgramId(departmentName, levelName, '');
        console.log(`Result: ${programId2 || 'undefined'}`);
        
        console.log('Test 3: Using department name as program name');
        const programId3 = await getProgramId('', levelName, departmentName);
        console.log(`Result: ${programId3 || 'undefined'}`);
        
        // Check if any program exists in DB with either name
        const directDbSearch = await prisma.program.findFirst({
          where: {
            OR: [
              { name: { contains: programName || departmentName } },
              { description: { contains: programName || departmentName } }
            ]
          },
          select: { id: true, name: true, description: true }
        });
        
        console.log('Direct DB search:');
        console.log(directDbSearch || 'No matching program found');
        
      } catch (error) {
        console.error('Error testing program ID lookup:', error);
      }

      // Test classroom lookup
      console.log('\nTESTING CLASSROOM ID LOOKUP:');
      try {
        // Test with modified parameters to trace the issue
        console.log('Test 1: Standard parameters');
        const classroomId1 = await getClassroomId(levelClassroom, departmentName, group, programName);
        console.log(`Result: ${classroomId1 || 'undefined'}`);
        
        console.log('Test 2: Classroom name format variations');
        const classroomId2 = await getClassroomId(levelClassroom, departmentName, '', '');
        console.log(`Result: ${classroomId2 || 'undefined'}`);
        
        // Check if any classroom exists with this level classroom
        const directDbSearch = await prisma.classroom.findFirst({
          where: {
            OR: [
              { name: { contains: levelClassroom } },
              { classroomId: { contains: levelClassroom } }
            ]
          },
          select: { id: true, name: true, classroomId: true }
        });
        
        console.log('Direct DB search:');
        console.log(directDbSearch || 'No matching classroom found');
        
        // Get matching classrooms for this level and department
        const matchingClassrooms = await prisma.classroom.findMany({
          where: {
            OR: [
              { name: { contains: levelClassroom } },
              { name: { contains: departmentName } },
            ]
          },
          select: { 
            id: true, 
            name: true, 
            classroomId: true,
            level: { select: { levelName: true } },
            department: { select: { name: true } }
          },
          take: 3
        });
        
        if (matchingClassrooms.length > 0) {
          console.log('Possible matching classrooms:');
          matchingClassrooms.forEach((c, i) => {
            console.log(`${i+1}. ID: ${c.id}, Name: ${c.name}, ClassroomId: ${c.classroomId}`);
            console.log(`   Level: ${c.level?.levelName || 'None'}, Dept: ${c.department?.name || 'None'}`);
          });
        }
      } catch (error) {
        console.error('Error testing classroom ID lookup:', error);
      }
    }
    
    // Check database data integrity between students and classrooms/programs
    console.log('\n=== Database Data Integrity ===');
    
    // Count students with missing programId
    const studentsWithoutProgram = await prisma.student.count({
      where: { programId: null }
    });
    
    // Count students with missing classroomId
    const studentsWithoutClassroom = await prisma.student.count({
      where: { classroomId: null }
    });
    
    // Total students
    const totalStudents = await prisma.student.count();
    
    console.log(`Students without Program ID: ${studentsWithoutProgram}/${totalStudents} (${Math.round(studentsWithoutProgram/totalStudents*100)}%)`);
    console.log(`Students without Classroom ID: ${studentsWithoutClassroom}/${totalStudents} (${Math.round(studentsWithoutClassroom/totalStudents*100)}%)`);
    
    // Get the distribution of levels for students
    const levelDistribution = await prisma.level.findMany({
      select: {
        levelName: true,
        _count: {
          select: {
            student: true
          }
        }
      }
    });
    
    console.log('\nStudent distribution by level:');
    levelDistribution.forEach(level => {
      console.log(`${level.levelName}: ${level._count.student} students`);
    });
    
  } catch (error) {
    console.error('Error testing lookup functions:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nFinished testing lookup functions.');
  }
}

// Run the test function
testLookupFunctions();
