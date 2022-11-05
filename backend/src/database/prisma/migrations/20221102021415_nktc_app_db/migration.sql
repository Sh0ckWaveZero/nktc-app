/*
  Warnings:

  - You are about to drop the column `stutus` on the `student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student" DROP COLUMN "stutus",
ADD COLUMN     "status" TEXT;
