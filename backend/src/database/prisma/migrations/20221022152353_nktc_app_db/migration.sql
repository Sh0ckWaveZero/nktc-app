/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `teacherOnClassroom` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "teacherOnClassroom_id_key" ON "teacherOnClassroom"("id");
