import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const levelData = () => {
  return [
    {
      levelId: 'L001',
      levelName: 'ปวช.',
      levelFullName: 'ระดับประกาศนียบัตรวิชาชีพ',
    },
    {
      levelId: 'L002',
      levelName: 'ปวส.',
      levelFullName: 'ระดับประกาศนียบัตรวิชาชีพชั้นสูง',
    },
  ];
};

/**
 * Seed levels into the database
 */
export const seedLevels = async () => {
  try {
    const levels = levelData();
    
    // Create each level
    const results = await Promise.all(
      levels.map(async (level) => {
        return await prisma.level.upsert({
          where: { levelId: level.levelId },
          update: level,
          create: level,
        });
      })
    );
    
    return results;
  } catch (error) {
    console.error('Error seeding levels:', error);
    throw error;
  }
};
