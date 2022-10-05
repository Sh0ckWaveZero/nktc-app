/*
  Warnings:

  - You are about to drop the column `accountId` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `teacher` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "student" DROP CONSTRAINT "student_accountId_fkey";

-- DropForeignKey
ALTER TABLE "teacher" DROP CONSTRAINT "teacher_accountId_fkey";

-- DropIndex
DROP INDEX "student_accountId_key";

-- DropIndex
DROP INDEX "teacher_accountId_key";

-- AlterTable
ALTER TABLE "student" DROP COLUMN "accountId";

-- AlterTable
ALTER TABLE "teacher" DROP COLUMN "accountId";

-- CreateTable
CREATE TABLE "reportCheckIn" (
    "id" TEXT NOT NULL,
    "reportId" SERIAL NOT NULL,
    "teacherId" TEXT,
    "classroomId" TEXT,
    "present" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "absent" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "late" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "leave" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "checkInDate" TIMESTAMP(3),
    "checkInTime" TIMESTAMP(3),
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "reportCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reportCheckIn_reportId_key" ON "reportCheckIn"("reportId");

-- AddForeignKey
ALTER TABLE "reportCheckIn" ADD CONSTRAINT "reportCheckIn_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportCheckIn" ADD CONSTRAINT "reportCheckIn_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
