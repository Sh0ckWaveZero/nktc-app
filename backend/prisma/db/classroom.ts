import { getClassroomId, getLevelClassroomId, getProgramId, readWorkSheetFromFile } from './utils';

export const Classroom = async () => {
  const workSheetsFromFile = readWorkSheetFromFile('classroom');
  const startDate = new Date();
  const admin = {
    createdBy: 'Admin',
    updatedBy: 'Admin',
    updatedAt: startDate,
    createdAt: startDate,
  };

  const level001 = {
    ...admin,
    level: {
      connect: {
        levelId: "L001"
      }
    }
  }
  const level002 = {
    ...admin,
    level: {
      connect: {
        levelId: "L002"
      }
    }
  }

  const classroom: any[] = await Promise.all(workSheetsFromFile[0].data
    .filter((data: any, id: number) => id > 1 && data)
    .map(async (item: any) => {
      const classroomId = item[0];
      const name = item[1];
      const levelClassroomId = await getLevelClassroomId(item[2], item[3]);
      const programId = await getProgramId(item[4], item[2].toString());
      const level = item[2].toString() === "ปวส." ? level002 : level001;

      return {
        classroomId,
        name,
        levelClassroom: {
          connect: {
            levelClassroomId: levelClassroomId
          }
        },
        program: {
          connect: {
            programId: programId
          }
        },
        ...level
      }
    }));

  return classroom;
}