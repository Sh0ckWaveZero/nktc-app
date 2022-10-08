/*
  Warnings:

  - Made the column `teacherId` on table `reportCheckIn` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "reportCheckIn" DROP CONSTRAINT "reportCheckIn_teacherId_fkey";

-- AlterTable
ALTER TABLE "reportCheckIn" ADD COLUMN     "teacherKey" TEXT,
ALTER COLUMN "teacherId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "reportCheckIn" ADD CONSTRAINT "reportCheckIn_teacherKey_fkey" FOREIGN KEY ("teacherKey") REFERENCES "teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
