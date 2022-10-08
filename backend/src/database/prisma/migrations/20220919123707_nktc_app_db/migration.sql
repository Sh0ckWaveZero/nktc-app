/*
  Warnings:

  - The primary key for the `TeacherToClassroom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TeacherToClassroom` table. All the data in the column will be lost.
  - Made the column `teacherId` on table `TeacherToClassroom` required. This step will fail if there are existing NULL values in that column.
  - Made the column `classroomId` on table `TeacherToClassroom` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TeacherToClassroom" DROP CONSTRAINT "TeacherToClassroom_classroomId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherToClassroom" DROP CONSTRAINT "TeacherToClassroom_teacherId_fkey";

-- DropIndex
DROP INDEX "TeacherToClassroom_teacherId_classroomId_key";

-- AlterTable
ALTER TABLE "TeacherToClassroom" DROP CONSTRAINT "TeacherToClassroom_pkey",
DROP COLUMN "id",
ALTER COLUMN "teacherId" SET NOT NULL,
ALTER COLUMN "classroomId" SET NOT NULL,
ADD CONSTRAINT "TeacherToClassroom_pkey" PRIMARY KEY ("teacherId", "classroomId");

-- AddForeignKey
ALTER TABLE "TeacherToClassroom" ADD CONSTRAINT "TeacherToClassroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherToClassroom" ADD CONSTRAINT "TeacherToClassroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
