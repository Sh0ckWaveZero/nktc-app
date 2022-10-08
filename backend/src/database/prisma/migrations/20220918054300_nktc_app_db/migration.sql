/*
  Warnings:

  - You are about to drop the `_ClassroomToLevelClassroom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ClassroomToTeacher` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ClassroomToLevelClassroom" DROP CONSTRAINT "_ClassroomToLevelClassroom_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClassroomToLevelClassroom" DROP CONSTRAINT "_ClassroomToLevelClassroom_B_fkey";

-- DropForeignKey
ALTER TABLE "_ClassroomToTeacher" DROP CONSTRAINT "_ClassroomToTeacher_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClassroomToTeacher" DROP CONSTRAINT "_ClassroomToTeacher_B_fkey";

-- AlterTable
ALTER TABLE "levelClassroom" ADD COLUMN     "classroomId" TEXT;

-- DropTable
DROP TABLE "_ClassroomToLevelClassroom";

-- DropTable
DROP TABLE "_ClassroomToTeacher";

-- CreateTable
CREATE TABLE "teacher_to_classroom" (
    "teacher_id" TEXT NOT NULL,
    "classroom_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "teacher_to_classroom_pkey" PRIMARY KEY ("teacher_id","classroom_id")
);

-- CreateTable
CREATE TABLE "classroom_to_level_classroom" (
    "levelClassroom_id" TEXT NOT NULL,
    "classroom_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "classroom_to_level_classroom_pkey" PRIMARY KEY ("levelClassroom_id","classroom_id")
);

-- AddForeignKey
ALTER TABLE "teacher_to_classroom" ADD CONSTRAINT "teacher_to_classroom_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_to_classroom" ADD CONSTRAINT "teacher_to_classroom_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_to_level_classroom" ADD CONSTRAINT "classroom_to_level_classroom_levelClassroom_id_fkey" FOREIGN KEY ("levelClassroom_id") REFERENCES "levelClassroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_to_level_classroom" ADD CONSTRAINT "classroom_to_level_classroom_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levelClassroom" ADD CONSTRAINT "levelClassroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
