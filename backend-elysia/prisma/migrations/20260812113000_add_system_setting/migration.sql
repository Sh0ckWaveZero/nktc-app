-- CreateTable
CREATE TABLE IF NOT EXISTS "system_setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "collegeAcronym" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "collegeNameEn" TEXT,
    "securityEmail" TEXT NOT NULL,
    "primaryDataResidency" TEXT NOT NULL,
    "primaryServerDetail" TEXT NOT NULL,
    "drRegion" TEXT,
    "systemUptime" TEXT NOT NULL DEFAULT '99.99%',
    "latestAuditCycle" TEXT,
    "latestAuditMonth" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "system_setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "system_setting_key_key" ON "system_setting"("key");
