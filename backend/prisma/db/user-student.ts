import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt'
import { createByAdmin, getBirthday, getClassroomId, getProgramId, readWorkSheetFromFile, getLevelByName } from "./utils";

export const userStudentData = async () => {
  const workSheetsFromFile = readWorkSheetFromFile('ปวส_65');
  const admin = createByAdmin();

  const userStudent = await Promise.all(workSheetsFromFile[0].data
    .filter((data: any, id: number) => id > 0 && data)
    .map(async (item: any) => {
      const idCard = item[1].toString();
      const studentId = item[2].toString();
      const password = await hash(studentId, 12);
      const levelName = item[4].toString().search(/ปวช/) !== -1 ? "ปวช." : "ปวส.";
      const level = getLevelByName(levelName);
      const birthDate = await getBirthday(item[8].toString());
      const classroomId = await getClassroomId(item[4]);
      const programId = await getProgramId(item[9], levelName);

      return Prisma.validator<Prisma.UserCreateInput>()(
        {
          username: studentId,
          password,
          role: "Student",
          account: {
            create: {
              title: item[5],
              firstName: item[6] ?? "",
              lastName: item[7] ?? "",
              idCard,
              birthDate,
              ...admin
            }
          },
          student: {
            create: {
              studentId,
              studentStatus: item[10] ?? "",
              group: item[3] ?? "",
              classroom: {
                connect: {
                  classroomId,
                }
              },
              program: {
                connect: {
                  programId,
                }
              },
              ...level,
              ...admin,
            },
          },
          ...admin,
        },
      );
    }));

  return userStudent;
}