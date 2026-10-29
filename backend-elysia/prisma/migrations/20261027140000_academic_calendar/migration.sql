CREATE TABLE "academic_calendar_year" (
    "academicYear" INTEGER NOT NULL,
    "selectedTerm" INTEGER NOT NULL,
    "term1Start" DATE NOT NULL,
    "term2Start" DATE NOT NULL,
    "term1Name" TEXT NOT NULL,
    "term2Name" TEXT NOT NULL,
    "startWeekOnMonday" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "academic_calendar_year_pkey" PRIMARY KEY ("academicYear")
);

CREATE TABLE "academic_calendar_state" (
    "id" TEXT NOT NULL DEFAULT 'current',
    "academicYear" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "academic_calendar_state_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "academic_calendar_event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "academic_calendar_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "academic_calendar_state_academicYear_key" ON "academic_calendar_state"("academicYear");
CREATE INDEX "academic_calendar_event_startDate_endDate_idx" ON "academic_calendar_event"("startDate", "endDate");

ALTER TABLE "academic_calendar_state"
    ADD CONSTRAINT "academic_calendar_state_academicYear_fkey"
    FOREIGN KEY ("academicYear") REFERENCES "academic_calendar_year"("academicYear")
    ON DELETE RESTRICT ON UPDATE CASCADE;
