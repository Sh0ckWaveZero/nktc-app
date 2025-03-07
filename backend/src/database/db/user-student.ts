import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import {
  createByAdmin,
  getBirthday,
  getClassroomId,
  getProgramId,
  readWorkSheetFromFile,
  getLevelByName,
  getLevelClassroomByName,
} from '../../utils/utils';

export const userStudentData = async (fileName: string) => {
  const workSheetsFromFile = readWorkSheetFromFile(fileName);
  const admin = createByAdmin();

  const userStudent = await Promise.all(
    workSheetsFromFile[0].data
      .filter((data: any, id: number) => id > 1 && data)
      .map(async (item: any) => {
        const [
          idCard,
          studentId,
          levelClassroom,
          title,
          firstName,
          lastName,
          programName,
          departmentName,
          group,
        ] = item;
        const password = await hash(studentId.toString(), 12);
        const levelName =
          levelClassroom.toString().search(/ปวช/) !== -1 ? 'ปวช.' : 'ปวส.';
        const levelClassroomId = await getLevelClassroomByName(levelClassroom);
        const level = await getLevelByName(levelName);
        // const birthDate = birthDateTh ? await getBirthday(birthDateTh.toString()) : null;
        const programId = await getProgramId(
          programName.trim(),
          levelName,
        );
        const classroomId = await getClassroomId(
          levelClassroom,
          departmentName.trim(),
          group,
          programName.trim(),
        );

        return Prisma.validator<Prisma.UserCreateInput>()({
          username: studentId.toString(),
          password,
          role: 'Student',
          account: {
            create: {
              title: title ?? '',
              firstName,
              lastName,
              idCard: idCard.toString() ?? null,
              ...admin,
            },
          },
          student: {
            create: {
              studentId,
              levelClassroom: {
                connect: {
                  id: levelClassroomId,
                },
              },
              classroom: {
                connect: {
                  id: classroomId,
                },
              },
              program: {
                connect: {
                  id: programId,
                },
              },
              ...level,
              ...admin,
            },
          },
          ...admin,
        });
      }),
  );

  return userStudent;
};
