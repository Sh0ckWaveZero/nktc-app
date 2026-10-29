-- AlterTable: Add activityType column to activityCheckInReport
ALTER TABLE "activityCheckInReport" ADD COLUMN "activityType" TEXT NOT NULL DEFAULT 'CLUB';

-- AlterTable: Add note column to activityCheckInReport
ALTER TABLE "activityCheckInReport" ADD COLUMN "note" TEXT;

-- CreateIndex
CREATE INDEX "activityCheckInReport_teacherId_classroomId_activityType_idx" ON "activityCheckInReport"("teacherId", "classroomId", "activityType");

-- CreateIndex
CREATE INDEX "activityCheckInReport_classroomId_checkInDate_idx" ON "activityCheckInReport"("classroomId", "checkInDate");

-- CreateIndex
CREATE INDEX "activityCheckInReport_checkInDate_idx" ON "activityCheckInReport"("checkInDate");
