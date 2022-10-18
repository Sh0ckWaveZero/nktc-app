import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt'
import { createByAdmin, readWorkSheetFromFile } from './utils';

export const userTeacher = async (fileName: string) => {
  const [workSheetsFromFile] = readWorkSheetFromFile(fileName);
  const admin = createByAdmin();

  const userTeacher = await Promise.all(workSheetsFromFile.data
    .filter((data: any, id: number) => id > 1 && data)
    .map(async (item: any) => {
      const [
        title,
        firstName,
        lastName,
        username,
        userPassword,
      ] = item;
      const password = await hash(userPassword, 12);

      return Prisma.validator<Prisma.UserCreateInput>()(
        {
          username,
          password,
          role: "Teacher",
          account: {
            create: {
              title,
              firstName,
              lastName,
              ...admin
            }
          },
          teacher: {
            create: {
              teacherId: username,
              status: "Active",
              ...admin
            }
          },
          ...admin,
        },
      );
    }));

  return userTeacher;
}