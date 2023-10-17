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
          no,
          idCard,
          studentId,
          levelClassroom,
          title,
          firstName,
          lastName,
          birthDateTh,
          programName,
          departmentName,
          group,
        ] = item;
        const password = await hash(studentId.toString(), 12);
        const levelName =
          levelClassroom.toString().search(/ปวช/) !== -1 ? 'ปวช.' : 'ปวส.';
        const levelClassroomId = await getLevelClassroomByName(levelClassroom);
        const level = await getLevelByName(levelName);
        const birthDate = await getBirthday(birthDateTh.toString());
        const programId = await getProgramId(
          departmentName,
          levelName,
          programName,
        );
        const classroomId = await getClassroomId(
          levelClassroom,
          departmentName,
          group,
          programName,
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
              birthDate,
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
