import { Prisma } from '@prisma/client';
import { createByAdmin, getLevelByName, readWorkSheetFromFile } from '../../utils/utils';

export const programData = async () => {
  const workSheetsFromFile = readWorkSheetFromFile('program');
  const admin = createByAdmin();

  return await Promise.all(workSheetsFromFile[0].data
    .filter((data: any, id: number) => id > 1 && data)
    .map(async (item: any) => {
      const programId = item[0].toString();
      const name = item[1].toString();
      const description = item[2].toString();
      const level = await getLevelByName(item[3].toString());
      return Prisma.validator<Prisma.ProgramCreateInput>()(
        {
          programId,
          name,
          description,
          ...level,
          ...admin,
        },
      );
    }));
}