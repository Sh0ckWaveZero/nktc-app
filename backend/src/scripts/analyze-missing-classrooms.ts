import { PrismaClient } from '@prisma/client';
import { readWorkSheetFromFile } from '../utils/utils';
import * as fs from 'fs';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * วิเคราะห์นักเรียนที่มี Classroom ID เป็น undefined
 * @param fileName ชื่อไฟล์ Excel ที่มีข้อมูลนักเรียน
 * @param outputFile ชื่อไฟล์ที่จะเก็บผลการวิเคราะห์
 */
async function analyzeStudentsWithoutClassroom(
  fileName: string,
  outputFile: string = 'classroom-analysis.json',
) {
  console.log(
    `=== Starting Analysis for Students Without Classroom from ${fileName} ===\n`,
  );

  try {
    // อ่านข้อมูลจากไฟล์ Excel
    const workSheetsFromFile = readWorkSheetFromFile(fileName);

    // เตรียมโครงสร้างข้อมูลสำหรับการวิเคราะห์
    const analysis = {
      totalRecords: 0,
      studentsWithoutClassroom: 0,
      missingClassroomNames: 0,
      classroomNamesButNoId: 0,
      problemDetails: [],
      classroomDistribution: {},
      existingClassrooms: [],
      existingPrograms: [],
    };

    // ดึงข้อมูล classroom ทั้งหมดที่มีในฐานข้อมูล
    const existingClassrooms = await prisma.classroom.findMany({
      include: {
        program: true,
        level: true,
        department: true,
      },
    });

    analysis.existingClassrooms = existingClassrooms.map((c) => ({
      id: c.id,
      name: c.name,
      programId: c.programId,
      programName: c.program?.name || null,
      levelId: c.levelId,
      levelName: c.level?.levelName || null,
      departmentId: c.departmentId,
      departmentName: c.department?.name || null,
    }));

    // ดึงข้อมูล program ทั้งหมดที่มีในฐานข้อมูล
    const existingPrograms = await prisma.program.findMany({
      include: {
        level: true,
        department: true,
      },
    });

    analysis.existingPrograms = existingPrograms.map((p) => ({
      id: p.id,
      programId: p.programId,
      name: p.name,
      levelId: p.levelId,
      levelName: p.level?.levelName || null,
      departmentId: p.departmentId,
      departmentName: p.department?.name || null,
    }));

    // วิเคราะห์ข้อมูลนักเรียนจากไฟล์ Excel
    const studentData = workSheetsFromFile[0].data.filter(
      (data: any, id: number) => id > 1 && data,
    );

    analysis.totalRecords = studentData.length;

    for (const item of studentData) {
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
      ] = item;

      // ข้ามรายการที่ไม่มีข้อมูลสำคัญ
      if (!studentId || !firstName) {
        continue;
      }

      // ตรวจสอบว่ามีชื่อห้องเรียนหรือไม่
      if (!classroomName) {
        analysis.missingClassroomNames++;
        analysis.studentsWithoutClassroom++;

        analysis.problemDetails.push({
          studentId,
          name: `${title || ''} ${firstName || ''} ${lastName || ''}`,
          problem: 'Missing classroom name in Excel file',
          programName: programName || 'Not specified',
          levelName: levelName || 'Not specified',
          departmentName: departmentName || 'Not specified',
        });

        continue;
      }

      // นับความถี่ของแต่ละห้องเรียน
      const standardClassroomName = classroomName.toString().trim();
      if (!analysis.classroomDistribution[standardClassroomName]) {
        analysis.classroomDistribution[standardClassroomName] = 1;
      } else {
        analysis.classroomDistribution[standardClassroomName]++;
      }

      // ตรวจสอบว่าห้องเรียนนี้มีในฐานข้อมูลหรือไม่
      const existingClassroom = existingClassrooms.find(
        (c) => c.name === standardClassroomName,
      );

      if (!existingClassroom) {
        analysis.classroomNamesButNoId++;
        analysis.studentsWithoutClassroom++;

        analysis.problemDetails.push({
          studentId,
          name: `${title || ''} ${firstName || ''} ${lastName || ''}`,
          problem: 'Classroom name exists in Excel but not found in database',
          classroomName: standardClassroomName,
          programName: programName || 'Not specified',
          levelName: levelName || 'Not specified',
          departmentName: departmentName || 'Not specified',
          possibleMatches: findSimilarClassrooms(
            standardClassroomName,
            existingClassrooms,
          ),
        });
      }

      // ตรวจสอบนักเรียนในฐานข้อมูลที่ไม่มี classroom
      try {
        const studentInDb = await prisma.student.findFirst({
          where: { studentId: studentId.toString() },
          include: {
            classroom: true,
            program: true,
            level: true,
            department: true,
          },
        });

        if (studentInDb && !studentInDb.classroomId) {
          analysis.studentsWithoutClassroom++;

          analysis.problemDetails.push({
            studentId,
            name: `${title || ''} ${firstName || ''} ${lastName || ''}`,
            problem: 'Student exists in database but has no classroom ID',
            classroomName: standardClassroomName,
            programName:
              programName || studentInDb.program?.name || 'Not specified',
            programIdInDb: studentInDb.programId || null,
            levelName:
              levelName || studentInDb.level?.levelName || 'Not specified',
            levelIdInDb: studentInDb.levelId || null,
            departmentName:
              departmentName || studentInDb.department?.name || 'Not specified',
            departmentIdInDb: studentInDb.departmentId || null,
          });
        }
      } catch (error) {
        console.log(
          `Error checking student ${studentId} in database: ${error.message}`,
        );
      }
    }

    // บันทึกผลการวิเคราะห์ลงในไฟล์
    fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2));

    console.log('\nAnalysis completed:');
    console.log(`- Total records: ${analysis.totalRecords}`);
    console.log(
      `- Students without classroom: ${analysis.studentsWithoutClassroom}`,
    );
    console.log(
      `- Missing classroom names in Excel: ${analysis.missingClassroomNames}`,
    );
    console.log(
      `- Classroom names in Excel but not in database: ${analysis.classroomNamesButNoId}`,
    );
    console.log(`- Details saved to: ${outputFile}`);

    return analysis;
  } catch (error) {
    console.error('Error analyzing students:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * ค้นหาห้องเรียนที่มีชื่อคล้ายกัน
 * @param classroomName ชื่อห้องเรียนที่ต้องการหาความคล้าย
 * @param existingClassrooms รายการห้องเรียนที่มีอยู่ในฐานข้อมูล
 */
function findSimilarClassrooms(
  classroomName: string,
  existingClassrooms: any[],
) {
  // ตัดคำที่ไม่เกี่ยวข้องออก
  const simplifiedName = classroomName
    .replace(/\s*\([^)]*\)\s*/g, ' ') // ตัดข้อความในวงเล็บ
    .replace(/\s+/g, ' ') // ตัดช่องว่างที่ซ้ำกัน
    .trim();

  // แยกชื่อห้องเรียนเป็นส่วน ๆ เพื่อค้นหาความคล้ายคลึง
  const parts = simplifiedName.split(/[\s\/-]+/);
  const level =
    parts.find((p) => p.includes('ปวช') || p.includes('ปวส'))?.trim() || '';
  const year = parts.find((p) => /^\d+$/.test(p))?.trim() || '';
  const room = parts.find((p) => /^[0-9\/]+$/.test(p))?.trim() || '';

  // ค้นหาห้องเรียนที่มีลักษณะคล้ายกัน
  return existingClassrooms
    .filter((c) => {
      const name = c.name?.toString() || '';

      // ถ้าชื่อมีความคล้ายคลึงเพียงพอ
      return (
        (level && name.includes(level)) ||
        (year && name.includes(year)) ||
        (simplifiedName.length > 3 && name.includes(simplifiedName))
      );
    })
    .map((c) => ({
      id: c.id,
      name: c.name,
      programName: c.program?.name || null,
      levelName: c.level?.levelName || null,
    }));
}

/**
 * แก้ไขนักเรียนที่มีปัญหา Classroom ID เป็น undefined
 * @param analysisFile ไฟล์ผลการวิเคราะห์ปัญหา
 * @param autoFix หากเป็น true จะทำการแก้ไขอัตโนมัติ
 */
async function fixStudentsWithoutClassroom(
  analysisFile: string,
  autoFix: boolean = false,
) {
  try {
    // อ่านผลวิเคราะห์จากไฟล์
    const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));

    console.log(
      `=== Starting fix for ${analysis.studentsWithoutClassroom} students without classroom ===\n`,
    );

    let fixedCount = 0;
    const unfixable = [];

    for (const problem of analysis.problemDetails) {
      // เฉพาะกรณีที่มีข้อเสนอแนะในการแก้ไข
      if (problem.possibleMatches && problem.possibleMatches.length > 0) {
        const bestMatch = problem.possibleMatches[0]; // เลือกตัวที่คล้ายที่สุด

        console.log(`Student ${problem.studentId}: ${problem.name}`);
        console.log(`  Problem: ${problem.problem}`);
        console.log(`  Classroom name in Excel: ${problem.classroomName}`);
        console.log(
          `  Best match in database: ${bestMatch.name} (ID: ${bestMatch.id})`,
        );

        if (autoFix) {
          try {
            // ค้นหานักเรียนในฐานข้อมูล
            const student = await prisma.student.findFirst({
              where: { studentId: problem.studentId.toString() },
            });

            if (student) {
              // อัปเดต classroom ID
              await prisma.student.update({
                where: { id: student.id },
                data: { classroomId: bestMatch.id },
              });

              console.log(
                `  ✅ Fixed: Assigned to classroom ${bestMatch.name}`,
              );
              fixedCount++;
            } else {
              console.log(`  ⚠️ Cannot fix: Student not found in database`);
              unfixable.push({
                ...problem,
                reason: 'Student not found in database',
              });
            }
          } catch (error) {
            console.log(
              `  ❌ Error fixing student ${problem.studentId}: ${error.message}`,
            );
            unfixable.push({
              ...problem,
              reason: `Database error: ${error.message}`,
            });
          }
        } else {
          console.log(
            `  ℹ️ Would fix by assigning to classroom ${bestMatch.name}`,
          );
        }
      } else {
        console.log(`Student ${problem.studentId}: ${problem.name}`);
        console.log(`  Problem: ${problem.problem}`);
        console.log(`  ⚠️ No suitable match found`);
        unfixable.push({ ...problem, reason: 'No suitable match found' });
      }

      console.log(''); // เพิ่มบรรทัดว่างเพื่อให้อ่านง่าย
    }

    const resultsFile = 'fix-classroom-results.json';
    fs.writeFileSync(
      resultsFile,
      JSON.stringify(
        {
          total: analysis.studentsWithoutClassroom,
          fixed: fixedCount,
          unfixable: unfixable.length,
          unfixableDetails: unfixable,
        },
        null,
        2,
      ),
    );

    console.log('\nFix operation completed:');
    console.log(`- Total problems: ${analysis.studentsWithoutClassroom}`);
    console.log(`- Fixed: ${fixedCount}`);
    console.log(`- Unfixable: ${unfixable.length}`);
    console.log(`- Details saved to: ${resultsFile}`);
  } catch (error) {
    console.error('Error fixing students without classroom:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// If this file is run directly
if (require.main === module) {
  const fileName = process.argv[2] || 'student-hcv-68';
  const command = process.argv[3] || 'analyze';
  const autoFix = process.argv[4] === 'autofix';

  const outputFile = `classroom-analysis-${
    new Date().toISOString().split('T')[0]
  }.json`;

  if (command === 'analyze') {
    analyzeStudentsWithoutClassroom(fileName, outputFile)
      .then(() => {
        console.log('Analysis completed.');
      })
      .catch((error) => {
        console.error('Analysis failed:', error);
      });
  } else if (command === 'fix') {
    const analysisFile = process.argv[4] || outputFile;

    fixStudentsWithoutClassroom(analysisFile, autoFix)
      .then(() => {
        console.log('Fix operation completed.');
      })
      .catch((error) => {
        console.error('Fix operation failed:', error);
      });
  } else {
    console.log('Invalid command. Use "analyze" or "fix".');
  }
}
