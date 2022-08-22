import { Level } from '@prisma/client'

export const levelData = () => {
  const startDate = new Date();
  const admin = {
    createdBy: 'Admin',
    updatedBy: 'Admin',
    updatedAt: startDate,
    createdAt: startDate,
  };
  return [
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
      ...admin
    }
  ]
}