-- AlterTable
ALTER TABLE "classroom" ADD COLUMN     "departmentId" TEXT;

-- AddForeignKey
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
