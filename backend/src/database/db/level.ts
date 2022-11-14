import { Prisma } from '@prisma/client';
import { createByAdmin } from '../../utils/utils';

export const levelData = () => {
  const admin = createByAdmin();
  return Prisma.validator<Prisma.LevelCreateInput[]>()(
    [
      {
        levelId: "L001",
        levelName: "ปวช.",
        levelFullName: "ประกาศนียบัตรวิชาชีพ",
        ...admin,
      },
      {
        levelId: "L002",
        levelName: "ปวส.",
        levelFullName: "ประกาศนียบัตรวิชาชีพชั้นสูง",
        ...admin,
      },
    ],
  );
}