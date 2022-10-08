-- AlterTable
ALTER TABLE "reportCheckIn" ALTER COLUMN "reportId" DROP DEFAULT,
ALTER COLUMN "reportId" SET DATA TYPE TEXT;
DROP SEQUENCE "reportCheckIn_reportId_seq";
