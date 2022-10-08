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

-- DropTable
DROP TABLE "_ClassroomToLevelClassroom";

-- DropTable
DROP TABLE "_ClassroomToTeacher";

-- CreateTable
CREATE TABLE "teacherToClassroom" (
    "teacherId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "teacherToClassroom_pkey" PRIMARY KEY ("teacherId","classroomId")
);

-- CreateTable
CREATE TABLE "classroomToLevelClassroom" (
    "levelClassroomId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "classroomToLevelClassroom_pkey" PRIMARY KEY ("levelClassroomId","classroomId")
);

-- AddForeignKey
ALTER TABLE "teacherToClassroom" ADD CONSTRAINT "teacherToClassroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacherToClassroom" ADD CONSTRAINT "teacherToClassroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroomToLevelClassroom" ADD CONSTRAINT "classroomToLevelClassroom_levelClassroomId_fkey" FOREIGN KEY ("levelClassroomId") REFERENCES "levelClassroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroomToLevelClassroom" ADD CONSTRAINT "classroomToLevelClassroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
