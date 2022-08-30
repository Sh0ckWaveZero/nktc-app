import { readWorkSheetFromFile } from './utils';

export const LevelClassroom = async () => {
  const workSheetsFromFile = readWorkSheetFromFile('level-classroom');
  const startDate = new Date();
  const admin = {
    createdBy: 'Admin',
    updatedBy: 'Admin',
    updatedAt: startDate,
    createdAt: startDate,
  };

  const level001 = {
    level: {
      connect: {
        levelId: "L001" // ปวช.
      }
    }
  }

  const level002 = {
    level: {
      connect: {
        levelId: "L002" // ปวส.
      }
    }
  }

  const levelClassroom: any[] = await Promise.all(workSheetsFromFile[0].data
    .filter((data: any, id: number) => id > 1 && data)
    .map(async (item: any) => {
      const levelClassroomId = item[0].toString();
      const name = item[1].toString();
      const level = item[2].toString() === "ปวช." ? level001 : level002;
      return {
        levelClassroomId,
        name,
        ...level,
        ...admin,
      }
    }));

  return levelClassroom;
}