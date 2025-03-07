import { PrismaClient } from '@Prisma/client';
import {
  getDepartId,
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
        const [
          classroomId,
          name,
          levelId,
          classroom,
          program,
          department,
          departmentIds,
        ] = item;

        const programId = await getProgramId(program, levelId);
        const level = await getLevelId(levelId);
        const departmentId = await getDepartId(departmentIds, classroomId);

        return {
          classroomId,
          name,
          programId,
          departmentId: departmentId?.id || '',
          levelId: Object.values(level)[0] as string,
        };
      }),
  );

  // Process each classroom - update if exists, create if not
  const results = await Promise.all(
    classroomData.map(async (data) => {
      // Check if classroom already exists
      const existingClassroom = await prisma.classroom.findUnique({
        where: { classroomId: data.classroomId },
      });

      if (existingClassroom) {
        // Update existing classroom
        return await prisma.classroom.update({
          where: { classroomId: data.classroomId },
          data: data,
        });
      } else {
        // Create new classroom
        return await prisma.classroom.create({
          data: data,
        });
      }
    })
  );

  console.log(`Updated/Created ${results.length} classrooms`);
  return results;
};
