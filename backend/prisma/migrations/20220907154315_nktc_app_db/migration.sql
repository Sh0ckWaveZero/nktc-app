/*
  Warnings:

  - A unique constraint covering the columns `[accountId]` on the table `student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId]` on the table `teacher` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "student" ADD COLUMN     "accountId" TEXT;

-- AlterTable
ALTER TABLE "teacher" ADD COLUMN     "accountId" TEXT;

-- CreateIndex
CREATE INDEX "account_name" ON "accounts"("firstName", "lastName");

-- CreateIndex
CREATE UNIQUE INDEX "student_accountId_key" ON "student"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_accountId_key" ON "teacher"("accountId");

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "user_username_verificationToken_idx" RENAME TO "users_index_verificationToken";
