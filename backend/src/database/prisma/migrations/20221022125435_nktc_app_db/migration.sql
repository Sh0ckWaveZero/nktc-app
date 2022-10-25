/*
  Warnings:

  - The primary key for the `teacherOnClassroom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assignedAt` on the `teacherOnClassroom` table. All the data in the column will be lost.
  - You are about to drop the column `assignedBy` on the `teacherOnClassroom` table. All the data in the column will be lost.
  - The required column `id` was added to the `teacherOnClassroom` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_at` to the `teacherOnClassroom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teacherOnClassroom" DROP CONSTRAINT "teacherOnClassroom_pkey",
DROP COLUMN "assignedAt",
DROP COLUMN "assignedBy",
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "updatedBy" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "teacherOnClassroom_pkey" PRIMARY KEY ("id");
