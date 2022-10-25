/*
  Warnings:

  - A unique constraint covering the columns `[teacherId,classroomId]` on the table `teacherOnClassroom` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "teacherOnClassroom_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "teacherOnClassroom_teacherId_classroomId_key" ON "teacherOnClassroom"("teacherId", "classroomId");
