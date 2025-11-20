-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN     "aiExtractionErrors" TEXT[],
ADD COLUMN     "aiExtractionScore" DOUBLE PRECISION,
ADD COLUMN     "applicationInstructions" TEXT,
ADD COLUMN     "externalApplicationUrl" TEXT,
ADD COLUMN     "fullDescriptionHtml" TEXT,
ADD COLUMN     "rawJobPosting" TEXT,
ADD COLUMN     "requiresReview" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AIExtractionCache" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "textHash" TEXT NOT NULL,
    "extractedData" JSONB NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "warnings" TEXT[],
    "extractionModel" TEXT NOT NULL DEFAULT 'gpt-4o',
    "hitCount" INTEGER NOT NULL DEFAULT 1,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIExtractionCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIExtractionCache_textHash_key" ON "AIExtractionCache"("textHash");

-- CreateIndex
CREATE INDEX "AIExtractionCache_textHash_idx" ON "AIExtractionCache"("textHash");

-- CreateIndex
CREATE INDEX "AIExtractionCache_lastUsedAt_idx" ON "AIExtractionCache"("lastUsedAt");
