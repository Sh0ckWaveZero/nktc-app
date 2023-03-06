import { Prisma, PrismaClient } from '@prisma/client';
import { createByAdmin, getLevelId, readWorkSheetFromFile } from '../../utils/utils';

const prisma = new PrismaClient();
export const programData = async () => {
  const workSheetsFromFile = readWorkSheetFromFile('program');
  const admin = createByAdmin();

  const programs = await Promise.all(workSheetsFromFile[0].data
    .filter((data: any, id: number) => id > 1 && data)
    .map(async (item: any) => {
      const programId = item[0].toString();
      const name = item[1].toString();
      const description = item[2].toString();
      const level = await getLevelId(item[3].toString());
      return Prisma.validator<Prisma.ProgramCreateManyInput>()(
        {
          programId,
          name,
          description,
          levelId: level?.id || '',
          ...admin,
        },
      );
    }));
  await prisma.program.createMany({
    data: programs,
  });
}

