import type { LevelCreateInput } from '../generated/prisma/client/models/Level';
import { createByAdmin } from '../../utils/utils';

export const levelData = () => {
  const admin = createByAdmin();
  return [
    {
      levelId: 'L001',
      levelName: 'ปวช.',
      levelFullName: 'ประกาศนียบัตรวิชาชีพ',
      ...admin,
    },
    {
      levelId: 'L002',
      levelName: 'ปวส.',
      levelFullName: 'ประกาศนียบัตรวิชาชีพชั้นสูง',
      ...admin,
    },
  ] satisfies LevelCreateInput[];
};
