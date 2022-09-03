import { Prisma } from '@Prisma/client';
import { getLevelByName, getLevelClassroomId, getProgramId, readWorkSheetFromFile } from './utils';

export const Classroom = async () => {
  const workSheetsFromFile = readWorkSheetFromFile('classroom');

  const classroom = await Promise.all(workSheetsFromFile[0].data
    .filter((data: any, id: number) => id > 1 && data)
    .map(async (item: any) => {
      const classroomId = item[0];
      const name = item[1];
      const levelClassroomId = await getLevelClassroomId(item[2], item[3]);
      const programId = await getProgramId(item[4], item[2].toString());
      const level = getLevelByName(item[2].toString());

      return Prisma.validator<Prisma.ClassroomCreateInput>()(
        {
          classroomId,
          name,
          levelClassroom: {
            connect: {
              levelClassroomId: levelClassroomId
            }
          },
          program: {
            connect: {
              programId: programId
            }
          },
          ...level
        }
      );
    }));

  return classroom;
}