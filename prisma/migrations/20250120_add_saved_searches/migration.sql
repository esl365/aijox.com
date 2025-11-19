-- Migration: Add Saved Searches & Job Alerts
-- Description: Enables teachers to save search criteria and receive email alerts for matching jobs
-- Date: 2025-01-20

-- Create SavedSearch table
CREATE TABLE "SavedSearch" (
  "id" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  -- Search criteria
  "name" TEXT,
  "filters" JSONB NOT NULL,

  -- Alert settings
  "alertEmail" BOOLEAN NOT NULL DEFAULT true,
  "alertFrequency" TEXT NOT NULL DEFAULT 'DAILY',
  "isActive" BOOLEAN NOT NULL DEFAULT true,

  -- Tracking
  "lastAlertSent" TIMESTAMP(3),
  "lastMatchCount" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- Add foreign key
ALTER TABLE "SavedSearch"
  ADD CONSTRAINT "SavedSearch_teacherId_fkey"
  FOREIGN KEY ("teacherId")
  REFERENCES "TeacherProfile"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX "SavedSearch_teacherId_isActive_idx" ON "SavedSearch"("teacherId", "isActive");
CREATE INDEX "SavedSearch_alertFrequency_isActive_idx" ON "SavedSearch"("alertFrequency", "isActive");
CREATE INDEX "SavedSearch_lastAlertSent_idx" ON "SavedSearch"("lastAlertSent");

-- Add comments for documentation
COMMENT ON TABLE "SavedSearch" IS 'Stores user-defined search criteria for job alerts';
COMMENT ON COLUMN "SavedSearch"."filters" IS 'JSON object containing search filters (country, subject, salary, etc.)';
COMMENT ON COLUMN "SavedSearch"."alertFrequency" IS 'How often to send alerts: INSTANT, DAILY, WEEKLY, NEVER';
COMMENT ON COLUMN "SavedSearch"."lastAlertSent" IS 'Timestamp of last alert email sent for this search';
COMMENT ON COLUMN "SavedSearch"."lastMatchCount" IS 'Number of jobs matched in the last alert (for comparison)';
