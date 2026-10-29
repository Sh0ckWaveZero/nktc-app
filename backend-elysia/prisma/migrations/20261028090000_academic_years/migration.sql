BEGIN;

CREATE TABLE "academic_year" (
  "academicYear" INTEGER PRIMARY KEY,
  "activatedAt" TIMESTAMP(3),
  "activatedBy" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT
);

CREATE TABLE "academic_year_state" (
  "id" TEXT PRIMARY KEY DEFAULT 'current' CHECK ("id" = 'current'),
  "academicYear" INTEGER NOT NULL UNIQUE REFERENCES "academic_year"("academicYear") ON DELETE RESTRICT ON UPDATE CASCADE,
  "version" INTEGER NOT NULL DEFAULT 1,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT
);

-- Register the existing calendar and explicitly labelled legacy visits first.
INSERT INTO "academic_year" ("academicYear", "activatedAt")
SELECT "academicYear", CURRENT_TIMESTAMP FROM "academic_calendar_year"
UNION
SELECT DISTINCT "academicYear"::INTEGER, CURRENT_TIMESTAMP FROM "visitStudent"
WHERE "academicYear" ~ '^[0-9]{4}$' AND "academicYear"::INTEGER BETWEEN 544 AND 9999
ON CONFLICT DO NOTHING;

INSERT INTO "academic_year" ("academicYear", "activatedAt")
SELECT COALESCE(
  (SELECT "academicYear" FROM "academic_calendar_state" WHERE "id" = 'current'),
  (SELECT MAX("academicYear") FROM "academic_year"),
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 543
), CURRENT_TIMESTAMP ON CONFLICT DO NOTHING;

INSERT INTO "academic_year_state" ("id", "academicYear")
SELECT 'current', COALESCE(
  (SELECT "academicYear" FROM "academic_calendar_state" WHERE "id" = 'current'),
  (SELECT MAX("academicYear") FROM "academic_year")
);

CREATE FUNCTION current_academic_year() RETURNS INTEGER
LANGUAGE SQL STABLE AS $$
  SELECT "academicYear" FROM "academic_year_state" WHERE "id" = 'current'
$$;

ALTER TABLE "academic_calendar_year" ADD CONSTRAINT "academic_calendar_year_academicYear_fkey"
  FOREIGN KEY ("academicYear") REFERENCES "academic_year"("academicYear") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Keep all original IDs, values and timestamps. Existing unlabelled records
-- belong to the year in use before this feature was introduced.
ALTER TABLE "reportCheckIn" ADD COLUMN "academicYearId" INTEGER NOT NULL DEFAULT current_academic_year();
ALTER TABLE "activityCheckInReport" ADD COLUMN "academicYearId" INTEGER NOT NULL DEFAULT current_academic_year();
ALTER TABLE "goodnessIndividual" ADD COLUMN "academicYearId" INTEGER NOT NULL DEFAULT current_academic_year();
ALTER TABLE "badnessIndividual" ADD COLUMN "academicYearId" INTEGER NOT NULL DEFAULT current_academic_year();
ALTER TABLE "visitStudent" ADD COLUMN "academicYearId" INTEGER NOT NULL DEFAULT current_academic_year();
ALTER TABLE "academic_calendar_event" ADD COLUMN "academicYearId" INTEGER NOT NULL DEFAULT current_academic_year();
UPDATE "visitStudent" SET "academicYearId" = "academicYear"::INTEGER
WHERE "academicYear" ~ '^[0-9]{4}$' AND "academicYear"::INTEGER BETWEEN 544 AND 9999;

ALTER TABLE "reportCheckIn" ADD CONSTRAINT "reportCheckIn_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("academicYear") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "activityCheckInReport" ADD CONSTRAINT "activityCheckInReport_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("academicYear") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "goodnessIndividual" ADD CONSTRAINT "goodnessIndividual_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("academicYear") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "badnessIndividual" ADD CONSTRAINT "badnessIndividual_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("academicYear") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "visitStudent" ADD CONSTRAINT "visitStudent_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("academicYear") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "academic_calendar_event" ADD CONSTRAINT "academic_calendar_event_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("academicYear") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "reportCheckIn_academicYearId_checkInDate_idx" ON "reportCheckIn" ("academicYearId", "checkInDate");
CREATE INDEX "activityCheckInReport_academicYearId_checkInDate_idx" ON "activityCheckInReport" ("academicYearId", "checkInDate");
CREATE INDEX "goodnessIndividual_academicYearId_studentId_idx" ON "goodnessIndividual" ("academicYearId", "studentId");
CREATE INDEX "badnessIndividual_academicYearId_studentId_idx" ON "badnessIndividual" ("academicYearId", "studentId");
CREATE INDEX "visitStudent_academicYearId_studentId_idx" ON "visitStudent" ("academicYearId", "studentId");
CREATE INDEX "academic_calendar_event_academicYearId_startDate_idx" ON "academic_calendar_event" ("academicYearId", "startDate");

-- Lock the same state row used by activation. A write either finishes before
-- activation or is checked against the new active year; it cannot slip across.
CREATE FUNCTION protect_academic_year_records() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE active_year INTEGER;
BEGIN
  SELECT "academicYear" INTO active_year FROM "academic_year_state" WHERE "id" = 'current' FOR SHARE;
  IF TG_OP = 'DELETE' THEN
    IF OLD."academicYearId" <> active_year THEN
      RAISE EXCEPTION 'ACADEMIC_YEAR_READ_ONLY' USING ERRCODE = 'P0001';
    END IF;
    RETURN OLD;
  END IF;
  IF NEW."academicYearId" <> active_year THEN
    RAISE EXCEPTION 'ACADEMIC_YEAR_CHANGED' USING ERRCODE = 'P0001';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW."academicYearId" <> OLD."academicYearId" THEN
    RAISE EXCEPTION 'ACADEMIC_YEAR_IMMUTABLE' USING ERRCODE = 'P0001';
  END IF;
  IF TG_TABLE_NAME = 'visitStudent' THEN
    NEW."academicYear" := NEW."academicYearId"::TEXT;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "protect_academic_year" BEFORE INSERT OR UPDATE OR DELETE ON "reportCheckIn" FOR EACH ROW EXECUTE FUNCTION protect_academic_year_records();
CREATE TRIGGER "protect_academic_year" BEFORE INSERT OR UPDATE OR DELETE ON "activityCheckInReport" FOR EACH ROW EXECUTE FUNCTION protect_academic_year_records();
CREATE TRIGGER "protect_academic_year" BEFORE INSERT OR UPDATE OR DELETE ON "goodnessIndividual" FOR EACH ROW EXECUTE FUNCTION protect_academic_year_records();
CREATE TRIGGER "protect_academic_year" BEFORE INSERT OR UPDATE OR DELETE ON "badnessIndividual" FOR EACH ROW EXECUTE FUNCTION protect_academic_year_records();
CREATE TRIGGER "protect_academic_year" BEFORE INSERT OR UPDATE OR DELETE ON "visitStudent" FOR EACH ROW EXECUTE FUNCTION protect_academic_year_records();
CREATE TRIGGER "protect_academic_year" BEFORE INSERT OR UPDATE OR DELETE ON "academic_calendar_event" FOR EACH ROW EXECUTE FUNCTION protect_academic_year_records();

COMMIT;
