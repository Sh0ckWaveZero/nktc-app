import { Prisma, PrismaClient } from '@prisma/client';
import {
  getDepartId,
  getDepartIdByName,
  getLevelByName,
  getLevelId,
  getProgramId,
  readWorkSheetFromFile,
} from '../../utils/utils';

const prisma = new PrismaClient();
export const Classroom = async () => {
  const workSheetsFromFile = readWorkSheetFromFile('classroom');

  const classroomData = await Promise.all(
    workSheetsFromFile[0].data
      .filter((data: any, id: number) => id > 1 && data)
      .map(async (item: any) => {
        try {
          const [
            classroomId,
            name,
            levelName,
            classroom,
            program,
            department,
            departmentIds,
          ] = item;

          // Generate a default classroom ID if missing
          const processedClassroomId =
            classroomId || `CR${Date.now().toString().slice(-8)}`;

          // Try to get program, level and department IDs
          let programId, level, departmentId;
          try {
            programId = await getProgramId(program, levelName);
          } catch (error) {
            console.log(
              `Error getting program ID for ${processedClassroomId}: ${error.message}`,
            );
            programId = null;
          }

          try {
            level = await getLevelId(levelName);
          } catch (error) {
            console.log(
              `Error getting level ID for ${processedClassroomId}: ${error.message}`,
            );
            level = { id: '' };
          }

          try {
            departmentId = await getDepartId(
              departmentIds,
              processedClassroomId,
            );
          } catch (error) {
            console.log(
              `Error getting department ID for ${processedClassroomId}: ${error.message}`,
            );
            departmentId = { id: '' };
          }

          return {
            classroomId: processedClassroomId,
            name: name || `Classroom ${processedClassroomId}`,
            programId,
            departmentId: departmentId?.id || '',
            levelId: level?.id || '',
          };
        } catch (error) {
          console.log('Error processing item:', item, error);
          // Generate a placeholder entry instead of returning null
          const fallbackId = `CR${Date.now().toString().slice(-8)}`;
          return {
            classroomId: fallbackId,
            name: `Classroom ${fallbackId}`,
            programId: null,
            departmentId: '',
            levelId: '',
          };
        }
      }),
  );

  // Process all classroom data, no filtering
  const results = [];
  for (const data of classroomData) {
    try {
      // Ensure name is not null or undefined
      const processedName =
        data.name ||
        `Classroom ${data.classroomId || Date.now().toString().slice(-8)}`;

      // For duplicate name issues, make the name unique by appending timestamp
      let uniqueName = processedName;
      try {
        const existingWithSameName = await prisma.classroom.findUnique({
          where: { name: processedName },
        });

        if (
          existingWithSameName &&
          existingWithSameName.classroomId !== data.classroomId
        ) {
          // If a record with the same name but different classroomId exists, make the name unique
          uniqueName = `${processedName} (${Date.now().toString().slice(-4)})`;
          console.log(
            `Renamed duplicate classroom name ${processedName} to ${uniqueName}`,
          );
        }
      } catch (error) {
        console.log(`Error checking for duplicate name: ${error.message}`);
        uniqueName = `${processedName} (${Date.now().toString().slice(-4)})`;
      }

      try {
        const result = await prisma.classroom.upsert({
          where: { classroomId: data.classroomId },
          update: {
            name: uniqueName,
            programId: data.programId,
            departmentId: data.departmentId || '',
            levelId: data.levelId || '',
          },
          create: {
            classroomId: data.classroomId,
            name: uniqueName,
            programId: data.programId,
            departmentId: data.departmentId || '',
            levelId: data.levelId || '',
          },
        });
        results.push(result);
        console.log(
          `Successfully processed classroom ${data.classroomId}: ${uniqueName}`,
        );
      } catch (error) {
        console.log(
          `Error upserting classroom ${data?.classroomId}: ${error.message}`,
        );

        // Try one more time with a new name if upsert failed
        try {
          const retryName = `${uniqueName} (retry-${Date.now()
            .toString()
            .slice(-6)})`;
          const result = await prisma.classroom.upsert({
            where: { classroomId: data.classroomId },
            update: {
              name: retryName,
              programId: data.programId,
              departmentId: data.departmentId || '',
              levelId: data.levelId || '',
            },
            create: {
              classroomId: data.classroomId,
              name: retryName,
              programId: data.programId,
              departmentId: data.departmentId || '',
              levelId: data.levelId || '',
            },
          });
          results.push(result);
          console.log(
            `Successfully processed classroom on retry ${data.classroomId}: ${retryName}`,
          );
        } catch (secondError) {
          console.log(
            `Final error with classroom ${data?.classroomId} even after retry: ${secondError.message}`,
          );
        }
      }
    } catch (error) {
      console.log(
        `Unexpected error with classroom ${data?.classroomId}: ${error.message}`,
      );
    }
  }

  console.log(
    `Updated/Created ${results.length} classrooms out of ${classroomData.length} entries`,
  );
  return results;
};
