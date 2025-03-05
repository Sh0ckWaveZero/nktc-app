import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Ensures that basic levels exist in the database
 */
export const ensureLevelsExist = async () => {
  // Define the basic levels that should exist
  const basicLevels = [
    { levelId: 'L001', levelName: 'ปวช.', levelFullName: 'ประกาศนียบัตรวิชาชีพ' },
    { levelId: 'L002', levelName: 'ปวส.', levelFullName: 'ประกาศนียบัตรวิชาชีพชั้นสูง' }
  ];

  // Create each level if it doesn't exist
  for (const level of basicLevels) {
    await createLevelIfNotExists(level.levelId, level.levelName, level.levelFullName);
  }
  
  console.log('Basic levels ensured in database');
};

/**
 * Creates a level if it doesn't exist
 * @param levelId - The level ID
 * @param levelName - The level name
 * @param levelFullName - The full name of the level
 */
export const createLevelIfNotExists = async (
  levelId: string,
  levelName: string,
  levelFullName: string
) => {
  // Check if the level exists
  const existingLevel = await prisma.level.findFirst({
    where: { levelId },
  });

  if (!existingLevel) {
    console.log(`Creating level: ${levelName} (${levelId})`);
    // Create the level with correct field names from schema
    return await prisma.level.create({
      data: {
        levelId: levelId.trim(),
        levelName: levelName.trim(),
        levelFullName: levelFullName.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM',
      },
    });
  }

  return existingLevel;
};

/**
 * Get level ID by level name or level ID
 * @param levelIdentifier Level name ('ปวช.' or 'ปวส.') or level ID ('L001' or 'L002')
 * @returns Object with level IDs mapped to the input identifier
 */
export const getLevelId = async (levelIdentifier: string): Promise<Record<string, string>> => {
  const levelMap: Record<string, string> = {};
  
  // Map of level names to level IDs
  const levelNameToId = {
    'ปวช.': 'L001',
    'ปวส.': 'L002'
  };
  
  // Determine if input is a level name or level ID
  let levelIdToFind = levelIdentifier;
  
  // If it's a level name, convert to corresponding level ID
  if (levelNameToId[levelIdentifier]) {
    levelIdToFind = levelNameToId[levelIdentifier];
  }
  
  // Find the level using the level ID
  const res = await prisma.level.findFirst({
    where: {
      levelId: levelIdToFind,
    },
    select: {
      id: true,
    },
  });
  
  if (res) {
    levelMap[levelIdentifier] = res.id;
  } else {
    console.error(`Level not found for identifier: ${levelIdentifier}`);
    // Try to create the level if it's one of our known IDs
    if (levelIdToFind === 'L001' || levelIdToFind === 'L002') {
      const levelName = levelIdToFind === 'L001' ? 'ปวช.' : 'ปวส.';
      const levelFullName = levelIdToFind === 'L001' ? 
        'ประกาศนียบัตรวิชาชีพ' : 'ประกาศนียบัตรวิชาชีพชั้นสูง';
      
      console.log(`Attempting to create level ${levelIdToFind}`);
      const newLevel = await createLevelIfNotExists(
        levelIdToFind, 
        levelName, 
        levelFullName
      );
      
      if (newLevel) {
        levelMap[levelIdentifier] = newLevel.id;
      }
    }
  }
  
  return levelMap;
};
