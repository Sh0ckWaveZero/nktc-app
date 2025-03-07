/*
  Warnings:

  - You are about to drop the column `classrommId` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `rolePermisssionId` on the `user_role` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "course" DROP CONSTRAINT "course_classrommId_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_rolePermisssionId_fkey";

-- AlterTable
ALTER TABLE "course" DROP COLUMN "classrommId",
ADD COLUMN     "classroomId" TEXT;

-- AlterTable
ALTER TABLE "user_role" DROP COLUMN "rolePermisssionId",
ADD COLUMN     "rolePermissionId" TEXT;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_rolePermissionId_fkey" FOREIGN KEY ("rolePermissionId") REFERENCES "role_permission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
