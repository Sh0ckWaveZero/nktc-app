/*
  Warnings:

  - You are about to drop the `_ClassroomToTeacher` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ClassroomToTeacher" DROP CONSTRAINT "_ClassroomToTeacher_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClassroomToTeacher" DROP CONSTRAINT "_ClassroomToTeacher_B_fkey";

-- DropTable
DROP TABLE "_ClassroomToTeacher";

-- CreateTable
CREATE TABLE "teacherOnClassroom" (
    "teacherId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "teacherOnClassroom_pkey" PRIMARY KEY ("teacherId","classroomId")
);

-- AddForeignKey
ALTER TABLE "teacherOnClassroom" ADD CONSTRAINT "teacherOnClassroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacherOnClassroom" ADD CONSTRAINT "teacherOnClassroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
