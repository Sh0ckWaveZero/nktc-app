import { Prisma, PrismaClient } from '@prisma/client';
import {
  createByAdmin,
  readWorkSheetFromFile,
} from '../../utils/utils';
import { getLevelId, ensureLevelsExist } from '../../utils/levelUtils';

const prisma = new PrismaClient();
export const programData = async () => {
  // First ensure that levels exist in the database
  await ensureLevelsExist();
  
  const workSheetsFromFile = readWorkSheetFromFile('program');
  const admin = createByAdmin();

  if (!workSheetsFromFile || workSheetsFromFile.length === 0) {
    console.error("No worksheet data found for program");
    return;
  }

  const validPrograms = [];
  
  // Process each row in the worksheet
  for (const item of workSheetsFromFile[0].data.filter((data: any, id: number) => id > 1 && data)) {
    try {
      if (!item[0] || !item[1] || !item[3]) {
        console.log("Skipping incomplete row:", item);
        continue;
      }
      
      const programId = item[0].toString();
      const name = item[1].toString();
      const description = item[2] ? item[2].toString() : '';
      const levelIdentifier = item[3].toString();
      
      console.log(`Processing program: ${name} with level: ${levelIdentifier}`);
      
      // Get level ID
      const levelIds = await getLevelId(levelIdentifier);
      const levelId = levelIds[levelIdentifier];
      
      if (!levelId) {
        console.error(`Level ID not found for: ${levelIdentifier}`);
        continue; // Skip this program if level is not found
      }
      
      validPrograms.push({
        programId,
        name,
        description,
        levelId,
        ...admin,
      });
    } catch (error) {
      console.error(`Error processing program row:`, item, error);
    }
  }

  if (validPrograms.length === 0) {
    console.error("No valid programs to create");
    return;
  }

  console.log(`Creating ${validPrograms.length} programs...`);
  
  await prisma.program.createMany({
    data: validPrograms,
    skipDuplicates: true,
  });
};
