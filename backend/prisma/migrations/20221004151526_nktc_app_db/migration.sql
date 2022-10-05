/*
  Warnings:

  - Made the column `classroomId` on table `reportCheckIn` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "reportCheckIn" DROP CONSTRAINT "reportCheckIn_classroomId_fkey";

-- AlterTable
ALTER TABLE "reportCheckIn" ADD COLUMN     "classroomKey" TEXT,
ALTER COLUMN "classroomId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "reportCheckIn" ADD CONSTRAINT "reportCheckIn_classroomKey_fkey" FOREIGN KEY ("classroomKey") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
