import { getClassroomId, getPrgramId, readWorkSheeFromFile } from './utils';

export const classNameData = async () => {
  const workSheetsFromFile = readWorkSheeFromFile('ระดับชั้น');
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

  const classNames: any[] = await Promise.all(workSheetsFromFile[0].data
    .filter((data: any, id: number) => id > 0 && data)
    .map(async (item: any) => {
      const level = item[2].toString() === "ปวส." ? level002 : level001;
      const programId = await getPrgramId(item[4], item[2].toString());
      const classroomId = await getClassroomId(item[2] + item[3]);

      return {
        classnameId: item[0],
        name: item[1],
        description: item[1],
        classroom: {
          connect: {
            classroomId: classroomId
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


  return classNames;
}