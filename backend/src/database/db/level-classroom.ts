import { PrismaClient } from '@Prisma/client';
import {
  readWorkSheetFromFile,
  createByAdmin,
  getLevelId,
} from '../../utils/utils';

const prisma = new PrismaClient();

export const createLevelClassroom = async () => {
  const workSheetsFromFile = readWorkSheetFromFile('level-classroom');
  const admin = createByAdmin();

  const levelClassroom = await Promise.all(
    workSheetsFromFile[0].data
      .filter((data: any, id: number) => id > 1 && data)
      .map(async (item: any) => {
        const levelClassroomId = item[0].toString().trim();
        const name = item[1].toString();
        const level = await getLevelId(item[2].toString());

        return {
          levelClassroomId,
          name,
          levelId: level?.id || '',
          ...admin,
        };
      }),
  );

  return await prisma.levelClassroom.createMany({
    data: levelClassroom,
  });
};
