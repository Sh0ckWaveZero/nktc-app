/*
  Warnings:

  - A unique constraint covering the columns `[teacherId,classroomId]` on the table `TeacherToClassroom` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TeacherToClassroom_teacherId_classroomId_key" ON "TeacherToClassroom"("teacherId", "classroomId");
