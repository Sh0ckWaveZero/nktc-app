import { Prisma, PrismaClient } from '@Prisma/client';
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

  const classroom = await Promise.all(
    workSheetsFromFile[0].data
      .filter((data: any, id: number) => id > 1 && data)
      .map(async (item: any) => {
        const [
          classroomId,
          name,
          levelName,
          classroom,
          program,
          department,
          departmentIds,
        ] = item;
        const programId = await getProgramId(program, levelName);
        const level = await getLevelId(levelName);
        const departmentId = await getDepartId(departmentIds, classroomId);
        return Prisma.validator<Prisma.ClassroomCreateManyInput>()({
          classroomId,
          name,
          programId,
          departmentId: departmentId?.id || '',
          levelId: level?.id || '',
        });
      }),
  );

  return await prisma.classroom.createMany({
    data: classroom,
  });
};
