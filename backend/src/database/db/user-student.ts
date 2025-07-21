// filepath: /Users/sh0ckpro/Works/Freelance/React/nktc-app/backend/src/database/db/user-student.ts
import { Prisma, Role } from '@prisma/client';
import { hash } from 'bcrypt';
import {
  createByAdmin,
  getBirthday,
  getClassroomId,
  getProgramId,
  readWorkSheetFromFile,
  getLevelByName,
  getLevelClassroomByName,
} from '../../utils/utils';

export const userStudentData = async (fileName: string) => {
  // Map to store unique student IDs and track duplicates
  const uniqueStudentIds = new Map();
  const workSheetsFromFile = readWorkSheetFromFile(fileName);
  const admin = createByAdmin();

  // First pass to identify duplicate student IDs
  workSheetsFromFile[0].data
    .filter((data: any, id: number) => id > 1 && data)
    .forEach((item: any) => {
      const studentId = item[2]?.toString();
      if (studentId) {
        if (uniqueStudentIds.has(studentId)) {
          uniqueStudentIds.set(studentId, uniqueStudentIds.get(studentId) + 1);
        } else {
          uniqueStudentIds.set(studentId, 1);
        }
      }
    });

  // Log duplicate student IDs
  uniqueStudentIds.forEach((count, id) => {
    if (count > 1) {
      console.log(
        `Warning: Student ID ${id} appears ${count} times in the import file`,
      );
    }
  });

  const userStudent = await Promise.all(
    workSheetsFromFile[0].data
      .filter((data: any, id: number) => id > 1 && data)
      .map(async (item: any, index: number) => {
        try {
          // Map columns based on the actual Excel structure:
          // ID Card, Student ID, Class, Title, First Name, Last Name, Dept, Branch, Type
          const [
            idCard, // ID Card
            studentId, // Student ID
            levelClassroom, // Class
            title, // Title
            firstName, // First Name
            lastName, // Last Name
            departmentName, // Dept
            programName, // Branch
            group, // Type
          ] = item;

          // Log the row being processed for debugging
          console.log(
            `Processing student row ${
              index + 2
            }: ID=${studentId}, Name=${title} ${firstName} ${lastName}`,
          );

          // Skip if no student ID
          if (!studentId) {
            console.log(`Skipping row ${index + 2} with missing student ID`);
            return null;
          }

          // Skip duplicates after the first occurrence
          if (uniqueStudentIds.get(studentId.toString()) > 1) {
            uniqueStudentIds.set(
              studentId.toString(),
              uniqueStudentIds.get(studentId.toString()) - 1,
            );
            if (uniqueStudentIds.get(studentId.toString()) !== 0) {
              console.log(
                `Skipping duplicate student ID ${studentId} to avoid unique constraint violation`,
              );
              return null;
            }
          }

          // Convert studentId to string and validate
          const studentIdString = studentId.toString().trim();
          if (!studentIdString) {
            console.log(
              `Skipping row ${
                index + 2
              } with empty student ID after conversion`,
            );
            return null;
          }

          const password = await hash(studentIdString, 12);

          // Determine level name with more robust checking
          let levelName: 'ปวช.' | 'ปวส.' = 'ปวช.'; // Default to ปวช. if we can't determine
          if (levelClassroom) {
            const levelClassroomStr = levelClassroom.toString();
            if (levelClassroomStr.includes('ปวส')) {
              levelName = 'ปวส.';
            } else if (levelClassroomStr.includes('ปวช')) {
              levelName = 'ปวช.';
            } else {
              console.log(
                `Cannot determine level from ${levelClassroomStr}, using default: ปวช.`,
              );
            }
          } else {
            console.log(
              `Level classroom is undefined for student ${studentIdString}, using default level: ปวช.`,
            );
          }

          // Safely get levelClassroomId
          let levelClassroomId = null;
          try {
            if (levelClassroom) {
              levelClassroomId = await getLevelClassroomByName(levelClassroom);
              console.log(
                `Level classroom ID for ${studentIdString}: ${levelClassroomId}`,
              );
            } else {
              console.log(
                `Level classroom is undefined for student ${studentIdString}`,
              );
            }
          } catch (error) {
            console.log(
              `Error getting level classroom ID for student ${studentIdString}: ${error.message}`,
            );
          }

          // Safely get level
          let levelConnection = null;
          try {
            levelConnection = await getLevelByName(levelName);
            if (
              levelConnection &&
              levelConnection.level &&
              levelConnection.level.connect.id
            ) {
              console.log(
                `Level ID for ${studentIdString}: ${levelConnection.level.connect.id}`,
              );
            } else {
              console.log(
                `Level ID not found for student ${studentIdString} with level ${levelName}`,
              );
              levelConnection = null;
            }
          } catch (error) {
            console.log(
              `Error getting level for student ${studentIdString}: ${error.message}`,
            );
            levelConnection = null;
          }

          // Since there's no birthdate in Excel, set to null
          const birthDate = null;

          // Safely get programId
          let programId = null;
          try {
            if (departmentName && levelName) {
              programId = await getProgramId(
                levelConnection.level.connect.id,
                programName.trim(),
                group,
              );

              console.log(`Program ID for ${studentIdString}: ${programId}`);
            } else {
              console.log(
                `Missing department or level for student ${studentIdString}`,
              );
            }
          } catch (error) {
            console.log(
              `Error getting program ID for student ${studentIdString}: ${error.message}`,
            );
          }

          // Safely get classroomId
          let classroomId = null;
          try {
            if (levelClassroom && departmentName) {
              classroomId = await getClassroomId(
                levelClassroom,
                departmentName,
                group || '',
                programName || '',
              );
              console.log(
                `Classroom ID for ${studentIdString}: ${classroomId}`,
              );
            } else {
              console.log(
                `Missing levelClassroom or departmentName for student ${studentIdString}`,
              );
            }
          } catch (error) {
            console.log(
              `Error getting classroom ID for student ${studentIdString}: ${error.message}`,
            );
          }

          // Create the student data object with only valid connections
          const studentData: any = {
            studentId: studentIdString,
            ...admin,
          };

          // Only add connections if the IDs are valid
          if (levelClassroomId) {
            studentData.levelClassroom = { connect: { id: levelClassroomId } };
          }

          if (classroomId) {
            studentData.classroom = { connect: { id: classroomId } };
          }

          if (programId) {
            studentData.program = { connect: { id: programId } };
          }

          if (levelConnection && levelConnection.level) {
            studentData.level = levelConnection.level;
          }

          // Use the correct Role enum value
          return {
            username: studentIdString,
            password,
            // Ensure we use the Prisma Role enum correctly
            role: Role.Student, // 'Student' as a Role enum value
            account: {
              create: {
                title: title?.toString() ?? '',
                firstName: firstName?.toString() || studentIdString,
                lastName: lastName?.toString() || '',
                idCard: idCard?.toString() ?? null,
                birthDate, // This will be null since birthDate column doesn't exist in Excel
                ...admin,
              },
            },
            student: {
              create: studentData,
            },
            ...admin,
          };
        } catch (error) {
          console.log(
            `Error processing student data at row ${index + 2}:`,
            error,
          );
          return null;
        }
      }),
  );

  // Filter out null values from processing errors
  const validUserStudents = userStudent.filter((item) => item !== null);
  console.log(
    `Successfully processed ${validUserStudents.length} out of ${userStudent.length} student records`,
  );

  return validUserStudents;
};
