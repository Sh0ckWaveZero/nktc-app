import { Prisma } from '@Prisma/client';
import { getLevelByName, readWorkSheetFromFile, createByAdmin } from '../../utils/utils';

export const LevelClassroom = async () => {
  const workSheetsFromFile = readWorkSheetFromFile('level-classroom');
  const admin = createByAdmin();

  const levelClassroom = await Promise.all(workSheetsFromFile[0].data
    .filter((data: any, id: number) => id > 1 && data)
    .map(async (item: any) => {
      const levelClassroomId = item[0].toString();
      const name = item[1].toString();
      const level = getLevelByName(item[2].toString());

      return Prisma.validator<Prisma.LevelClassroomCreateInput>()(
        {
          levelClassroomId,
          name,
          ...level,
          ...admin,
        }
      );
    }));

  return levelClassroom;
}