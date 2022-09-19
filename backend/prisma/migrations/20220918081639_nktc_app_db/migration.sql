-- AlterTable
ALTER TABLE "teacher" ADD COLUMN     "classroomIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
