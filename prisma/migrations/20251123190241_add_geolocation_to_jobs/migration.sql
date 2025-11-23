-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN     "geocode_confidence" DOUBLE PRECISION,
ADD COLUMN     "geocoded_at" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "lat_lng_idx" ON "JobPosting"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "geocoded_idx" ON "JobPosting"("geocoded_at");
