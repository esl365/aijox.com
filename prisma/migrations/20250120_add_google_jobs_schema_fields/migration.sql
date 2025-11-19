-- Migration: Add Google for Jobs Schema Fields
-- Description: Adds fields required for Google for Jobs structured data markup
-- Date: 2025-01-20

-- Add Google for Jobs specific fields to JobPosting table
ALTER TABLE "JobPosting"
  ADD COLUMN "expiresAt" TIMESTAMP(3),
  ADD COLUMN "employmentType" TEXT DEFAULT 'FULL_TIME',
  ADD COLUMN "educationRequirements" TEXT,
  ADD COLUMN "experienceRequirements" TEXT,
  ADD COLUMN "applicationUrl" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "JobPosting"."expiresAt" IS 'Job posting expiration date for Google for Jobs validThrough';
COMMENT ON COLUMN "JobPosting"."employmentType" IS 'Employment type: FULL_TIME, PART_TIME, CONTRACT, TEMPORARY, INTERN';
COMMENT ON COLUMN "JobPosting"."educationRequirements" IS 'Education requirements (e.g., Bachelor degree in Education)';
COMMENT ON COLUMN "JobPosting"."experienceRequirements" IS 'Detailed experience requirements';
COMMENT ON COLUMN "JobPosting"."applicationUrl" IS 'Custom application URL (defaults to platform URL)';

-- Optional: Set default expiresAt for existing jobs (30 days from creation)
-- UPDATE "JobPosting"
-- SET "expiresAt" = "createdAt" + INTERVAL '30 days'
-- WHERE "expiresAt" IS NULL AND "status" = 'ACTIVE';
