-- AlterTable
ALTER TABLE "activityCheckInReport" ADD COLUMN     "internship" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "reportCheckIn" ADD COLUMN     "internship" TEXT[] DEFAULT ARRAY[]::TEXT[];
