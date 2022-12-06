/*
  Warnings:

  - Made the column `programId` on table `program` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "department_departmentId_key";

-- DropIndex
DROP INDEX "program_programId_description_key";

-- AlterTable
ALTER TABLE "program" ALTER COLUMN "programId" SET NOT NULL;

-- AlterTable
ALTER TABLE "student" ALTER COLUMN "status" SET DEFAULT 'normal';

-- CreateTable
CREATE TABLE "activityCheckInReport" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherKey" TEXT,
    "classroomId" TEXT NOT NULL,
    "classroomKey" TEXT,
    "present" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "absent" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "checkInDate" TIMESTAMP(3),
    "checkInTime" TIMESTAMP(3),
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "activityCheckInReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "activityCheckInReport" ADD CONSTRAINT "activityCheckInReport_teacherKey_fkey" FOREIGN KEY ("teacherKey") REFERENCES "teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activityCheckInReport" ADD CONSTRAINT "activityCheckInReport_classroomKey_fkey" FOREIGN KEY ("classroomKey") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
