/*
  Warnings:

  - You are about to drop the column `classroomId` on the `levelClassroom` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "levelClassroom" DROP CONSTRAINT "levelClassroom_classroomId_fkey";

-- AlterTable
ALTER TABLE "levelClassroom" DROP COLUMN "classroomId";

-- CreateTable
CREATE TABLE "_ClassroomToLevelClassroom" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ClassroomToLevelClassroom_AB_unique" ON "_ClassroomToLevelClassroom"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassroomToLevelClassroom_B_index" ON "_ClassroomToLevelClassroom"("B");

-- AddForeignKey
ALTER TABLE "_ClassroomToLevelClassroom" ADD CONSTRAINT "_ClassroomToLevelClassroom_A_fkey" FOREIGN KEY ("A") REFERENCES "classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassroomToLevelClassroom" ADD CONSTRAINT "_ClassroomToLevelClassroom_B_fkey" FOREIGN KEY ("B") REFERENCES "levelClassroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
