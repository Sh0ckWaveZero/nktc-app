-- CreateTable
CREATE TABLE "goodnessIndividual" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentKey" TEXT NOT NULL,
    "classroomId" TEXT,
    "goodnessScore" INTEGER,
    "goodnessDetail" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "goodnessIndividual_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "goodnessIndividual" ADD CONSTRAINT "goodnessIndividual_studentKey_fkey" FOREIGN KEY ("studentKey") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goodnessIndividual" ADD CONSTRAINT "goodnessIndividual_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
