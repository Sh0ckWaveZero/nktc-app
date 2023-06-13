-- CreateTable
CREATE TABLE "visitStudent" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentKey" TEXT NOT NULL,
    "classroomId" TEXT,
    "visitDate" TIMESTAMP(3),
    "visitDetail" JSONB,
    "visitMap" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visitNo" INTEGER,
    "academicYear" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "visitStudent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "visitStudent" ADD CONSTRAINT "visitStudent_studentKey_fkey" FOREIGN KEY ("studentKey") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitStudent" ADD CONSTRAINT "visitStudent_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
