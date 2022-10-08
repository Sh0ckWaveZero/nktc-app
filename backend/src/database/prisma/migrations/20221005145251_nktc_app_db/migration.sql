/*
  Warnings:

  - You are about to drop the column `reportId` on the `reportCheckIn` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "reportCheckIn_reportId_key";

-- AlterTable
ALTER TABLE "reportCheckIn" DROP COLUMN "reportId";
