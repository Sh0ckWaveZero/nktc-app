import { Prisma } from '@Prisma/client';
import { getLevelByName, getLevelClassroomId, getProgramId, readWorkSheetFromFile } from './utils';

export const Classroom = async () => {
  const workSheetsFromFile = readWorkSheetFromFile('classroom');

  const classroom = await Promise.all(workSheetsFromFile[0].data
    .filter((data: any, id: number) => id > 1 && data)
    .map(async (item: any) => {
      const [classroomId, name, levelName, classroom, program] = item;
      // const levelClassroomId = await getLevelClassroomId(levelName, classroom);
      const programId = await getProgramId(program, levelName);
      const level = getLevelByName(levelName);

      return Prisma.validator<Prisma.ClassroomCreateInput>()(
        {
          classroomId,
          name,
          // levelClassroom: {
          //   connect: {
          //     id: levelClassroomId
          //   }
          // },
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