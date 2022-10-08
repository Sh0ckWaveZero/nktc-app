/*
  Warnings:

  - You are about to drop the column `levelClassroom_id` on the `ClassroomToLevelClassroom` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClassroomToLevelClassroom" DROP CONSTRAINT "ClassroomToLevelClassroom_levelClassroom_id_fkey";

-- AlterTable
ALTER TABLE "ClassroomToLevelClassroom" DROP COLUMN "levelClassroom_id",
ADD COLUMN     "levelClassroomId" TEXT;

-- AddForeignKey
ALTER TABLE "ClassroomToLevelClassroom" ADD CONSTRAINT "ClassroomToLevelClassroom_levelClassroomId_fkey" FOREIGN KEY ("levelClassroomId") REFERENCES "levelClassroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
