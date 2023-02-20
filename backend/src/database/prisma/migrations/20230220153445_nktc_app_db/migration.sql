-- AlterTable
ALTER TABLE "goodnessIndividual" ADD COLUMN     "goodDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "badnessIndividual" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentKey" TEXT NOT NULL,
    "classroomId" TEXT,
    "badnessScore" INTEGER,
    "badnessDetail" TEXT,
    "image" TEXT,
    "badDate" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "badnessIndividual_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "badnessIndividual" ADD CONSTRAINT "badnessIndividual_studentKey_fkey" FOREIGN KEY ("studentKey") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badnessIndividual" ADD CONSTRAINT "badnessIndividual_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
