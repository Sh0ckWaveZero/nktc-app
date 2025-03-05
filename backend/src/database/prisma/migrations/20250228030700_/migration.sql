-- AlterTable
ALTER TABLE "_ClassroomToLevelClassroom" ADD CONSTRAINT "_ClassroomToLevelClassroom_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ClassroomToLevelClassroom_AB_unique";

-- AlterTable
ALTER TABLE "_ClassroomToTeacher" ADD CONSTRAINT "_ClassroomToTeacher_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ClassroomToTeacher_AB_unique";
