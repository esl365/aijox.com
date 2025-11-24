/**
 * Backfill Geocoding Script
 *
 * This script geocodes all existing jobs that don't have coordinates yet.
 * It uses the OpenCage Geocoder API with rate limiting to respect the free tier limit.
 */

import { prisma } from '../lib/db';
import { GeocodingService } from '../lib/map/geocoding';
import { getCountryCenterCoordinates } from '../lib/map/server-utils';

const BATCH_SIZE = 50; // Process 50 jobs at a time
const DELAY_BETWEEN_REQUESTS = 150; // 150ms = ~400 requests/minute (well under 2,500/day limit)

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function backfillGeocoding() {
  console.log('🗺️  Starting geocoding backfill process...\n');

  // 1. Count jobs without coordinates
  const jobsWithoutCoords = await prisma.jobPosting.count({
    where: {
      OR: [
        { latitude: null },
        { longitude: null },
      ],
      status: 'ACTIVE',
    },
  });

  console.log(`📊 Found ${jobsWithoutCoords} jobs without coordinates\n`);

  if (jobsWithoutCoords === 0) {
    console.log('✅ All jobs already have coordinates!');
    return;
  }

  // 2. Fetch jobs in batches
  let processedCount = 0;
  let successCount = 0;
  let fallbackCount = 0;
  let errorCount = 0;

  while (processedCount < jobsWithoutCoords) {
    const jobs = await prisma.jobPosting.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
        ],
        status: 'ACTIVE',
      },
      select: {
        id: true,
        city: true,
        country: true,
        title: true,
      },
      take: BATCH_SIZE,
    });

    if (jobs.length === 0) break;

    console.log(`\n📦 Processing batch: ${processedCount + 1}-${processedCount + jobs.length} of ${jobsWithoutCoords}`);

    // 3. Process each job
    for (const job of jobs) {
      try {
        const query = `${job.city}, ${job.country}`;
        console.log(`  🔍 Geocoding: ${query}`);

        // Try OpenCage API first
        const result = await GeocodingService.geocode(query);

        if (result) {
          // Success - update with geocoded coordinates
          await prisma.jobPosting.update({
            where: { id: job.id },
            data: {
              latitude: result.latitude,
              longitude: result.longitude,
              geocodedAt: new Date(),
              geocodeConfidence: result.confidence,
            },
          });
          console.log(`  ✅ Success: (${result.latitude}, ${result.longitude}) - confidence: ${result.confidence}`);
          successCount++;
        } else {
          // Fallback to country center
          const countryCenter = getCountryCenterCoordinates(job.country);

          if (countryCenter) {
            await prisma.jobPosting.update({
              where: { id: job.id },
              data: {
                latitude: countryCenter.lat,
                longitude: countryCenter.lng,
                geocodedAt: new Date(),
                geocodeConfidence: 0.3, // Low confidence for fallback
              },
            });
            console.log(`  ⚠️  Fallback: Using ${countryCenter.name} center (${countryCenter.lat}, ${countryCenter.lng})`);
            fallbackCount++;
          } else {
            console.log(`  ❌ Error: No country center found for ${job.country}`);
            errorCount++;
          }
        }

        processedCount++;

        // Rate limiting
        await sleep(DELAY_BETWEEN_REQUESTS);
      } catch (error) {
        console.error(`  ❌ Error geocoding job ${job.id}:`, error);
        errorCount++;
        processedCount++;
      }
    }
  }

  // 4. Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Geocoding Backfill Complete!\n');
  console.log(`Total processed: ${processedCount}`);
  console.log(`✅ Successfully geocoded: ${successCount}`);
  console.log(`⚠️  Fallback to country center: ${fallbackCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));
}

// Run the script
backfillGeocoding()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
