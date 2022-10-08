/*
  Warnings:

  - You are about to drop the `_ClassroomToLevelClassroom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `classroom_to_level_classroom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teacher_to_classroom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ClassroomToLevelClassroom" DROP CONSTRAINT "_ClassroomToLevelClassroom_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClassroomToLevelClassroom" DROP CONSTRAINT "_ClassroomToLevelClassroom_B_fkey";

-- DropForeignKey
ALTER TABLE "classroom_to_level_classroom" DROP CONSTRAINT "classroom_to_level_classroom_classroom_id_fkey";

-- DropForeignKey
ALTER TABLE "classroom_to_level_classroom" DROP CONSTRAINT "classroom_to_level_classroom_levelClassroom_id_fkey";

-- DropForeignKey
ALTER TABLE "teacher_to_classroom" DROP CONSTRAINT "teacher_to_classroom_classroom_id_fkey";

-- DropForeignKey
ALTER TABLE "teacher_to_classroom" DROP CONSTRAINT "teacher_to_classroom_teacher_id_fkey";

-- DropTable
DROP TABLE "_ClassroomToLevelClassroom";

-- DropTable
DROP TABLE "classroom_to_level_classroom";

-- DropTable
DROP TABLE "teacher_to_classroom";

-- CreateTable
CREATE TABLE "TeacherToClassroom" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT,
    "classroomId" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "TeacherToClassroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassroomToLevelClassroom" (
    "id" TEXT NOT NULL,
    "levelClassroom_id" TEXT,
    "classroomId" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "ClassroomToLevelClassroom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeacherToClassroom" ADD CONSTRAINT "TeacherToClassroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherToClassroom" ADD CONSTRAINT "TeacherToClassroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomToLevelClassroom" ADD CONSTRAINT "ClassroomToLevelClassroom_levelClassroom_id_fkey" FOREIGN KEY ("levelClassroom_id") REFERENCES "levelClassroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomToLevelClassroom" ADD CONSTRAINT "ClassroomToLevelClassroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
