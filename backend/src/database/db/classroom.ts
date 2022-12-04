import { Prisma } from '@Prisma/client';
import { getDepartIdByName, getLevelByName, getProgramId, readWorkSheetFromFile } from '../../utils/utils';

export const Classroom = async () => {
  const workSheetsFromFile = readWorkSheetFromFile('classroom');

  const classroom = await Promise.all(workSheetsFromFile[0].data
    .filter((data: any, id: number) => id > 1 && data)
    .map(async (item: any) => {
      const [classroomId, name, levelName, classroom, program, department, departmentIds] = item;
      const programId = await getProgramId(program, levelName);
      const level = await getLevelByName(levelName);
      const departmentId = await getDepartIdByName(departmentIds, classroomId);
      return Prisma.validator<Prisma.ClassroomCreateInput>()(
        {
          classroomId,
          name,
          program: {
            connect: {
              id: programId
            }
          },
          department: {
            connect: {
              id: departmentId
            }
          },
          ...level
        }
      );
    }));
  return classroom;
}