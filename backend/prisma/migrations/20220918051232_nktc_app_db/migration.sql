/*
  Warnings:

  - You are about to drop the `classroomToLevelClassroom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teacherToClassroom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "classroomToLevelClassroom" DROP CONSTRAINT "classroomToLevelClassroom_classroomId_fkey";

-- DropForeignKey
ALTER TABLE "classroomToLevelClassroom" DROP CONSTRAINT "classroomToLevelClassroom_levelClassroomId_fkey";

-- DropForeignKey
ALTER TABLE "teacherToClassroom" DROP CONSTRAINT "teacherToClassroom_classroomId_fkey";

-- DropForeignKey
ALTER TABLE "teacherToClassroom" DROP CONSTRAINT "teacherToClassroom_teacherId_fkey";

-- DropTable
DROP TABLE "classroomToLevelClassroom";

-- DropTable
DROP TABLE "teacherToClassroom";

-- CreateTable
CREATE TABLE "TeacherToClassroom" (
    "teacherId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "TeacherToClassroom_pkey" PRIMARY KEY ("teacherId","classroomId")
);

-- CreateTable
CREATE TABLE "ClassroomToLevelClassroom" (
    "levelClassroomId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "ClassroomToLevelClassroom_pkey" PRIMARY KEY ("levelClassroomId","classroomId")
);

-- AddForeignKey
ALTER TABLE "TeacherToClassroom" ADD CONSTRAINT "TeacherToClassroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherToClassroom" ADD CONSTRAINT "TeacherToClassroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomToLevelClassroom" ADD CONSTRAINT "ClassroomToLevelClassroom_levelClassroomId_fkey" FOREIGN KEY ("levelClassroomId") REFERENCES "levelClassroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomToLevelClassroom" ADD CONSTRAINT "ClassroomToLevelClassroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
