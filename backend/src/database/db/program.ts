import { PrismaClient } from '../generated/prisma/client';
import {
  createByAdmin,
  getLevelId,
  readWorkSheetFromFile,
} from '../../utils/utils';

const prisma = new PrismaClient();
export const programData = async () => {
  const workSheetsFromFile = readWorkSheetFromFile('program');
  const admin = createByAdmin();

  console.log(
    `🚀 Processing ${workSheetsFromFile[0].data.length - 2} program records...`,
  );

  // Use sequential processing instead of Promise.all to handle duplicates better
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < workSheetsFromFile[0].data.length; i++) {
    const item = workSheetsFromFile[0].data[i];

    // Skip header rows and empty rows
    if (i <= 1 || !item || item.length < 4) {
      continue;
    }

    try {
      const programId = item[0]?.toString().trim() || '';
      const name = item[1]?.toString().trim() || '';
      const description = item[2]?.toString().trim() || '';
      const levelString = item[3]?.toString().trim() || '';

      if (!programId) {
        console.warn(`Skipping program with empty ID at row ${i + 1}`);
        errorCount++;
        continue;
      }

      const level = await getLevelId(levelString);

      // Use upsert to handle duplicates
      await prisma.program.upsert({
        where: { programId },
        update: {
          name: name,
          description: description,
          levelId: level?.id || null,
          ...admin,
        },
        create: {
          programId,
          name: name,
          description: description,
          levelId: level?.id || null,
          ...admin,
        },
      });

      successCount++;
      console.log(`✅ Processed program: ${programId} - ${name}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Error processing program at row ${i + 1}:`, error);
      // Continue processing other items
    }
  }

  console.log(
    `✅ Program processing complete: ${successCount} successful, ${errorCount} errors`,
  );
};
