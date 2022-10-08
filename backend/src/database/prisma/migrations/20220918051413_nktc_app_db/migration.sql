/*
  Warnings:

  - You are about to drop the `ClassroomToLevelClassroom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeacherToClassroom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClassroomToLevelClassroom" DROP CONSTRAINT "ClassroomToLevelClassroom_classroomId_fkey";

-- DropForeignKey
ALTER TABLE "ClassroomToLevelClassroom" DROP CONSTRAINT "ClassroomToLevelClassroom_levelClassroomId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherToClassroom" DROP CONSTRAINT "TeacherToClassroom_classroomId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherToClassroom" DROP CONSTRAINT "TeacherToClassroom_teacherId_fkey";

-- DropTable
DROP TABLE "ClassroomToLevelClassroom";

-- DropTable
DROP TABLE "TeacherToClassroom";

-- CreateTable
CREATE TABLE "_ClassroomToTeacher" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ClassroomToLevelClassroom" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ClassroomToTeacher_AB_unique" ON "_ClassroomToTeacher"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassroomToTeacher_B_index" ON "_ClassroomToTeacher"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClassroomToLevelClassroom_AB_unique" ON "_ClassroomToLevelClassroom"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassroomToLevelClassroom_B_index" ON "_ClassroomToLevelClassroom"("B");

-- AddForeignKey
ALTER TABLE "_ClassroomToTeacher" ADD CONSTRAINT "_ClassroomToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassroomToTeacher" ADD CONSTRAINT "_ClassroomToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassroomToLevelClassroom" ADD CONSTRAINT "_ClassroomToLevelClassroom_A_fkey" FOREIGN KEY ("A") REFERENCES "classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassroomToLevelClassroom" ADD CONSTRAINT "_ClassroomToLevelClassroom_B_fkey" FOREIGN KEY ("B") REFERENCES "levelClassroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
