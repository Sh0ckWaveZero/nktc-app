import { Prisma } from '@Prisma/client';
import { createByAdmin, readWorkSheetFromFile } from '../../utils/utils';

export const departmentData = async () => {
  const workSheetsFromFile = readWorkSheetFromFile('department');
  const admin = createByAdmin();

  const departments = await Promise.all(
    workSheetsFromFile[0].data
      .filter((data: any, id: number) => id > 1 && data)
      .map(async (item: any) => {
        const departmentId = item[0].trim().toString();
        const name = item[1].trim().toString();
        const description = item[2].toString();

        return Prisma.validator<Prisma.DepartmentCreateInput>()({
          departmentId,
          name,
          description,
          ...admin,
        });
      }),
  );

  return departments;
};
