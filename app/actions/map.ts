/**
 * Server Actions for Map View
 * SPARC: Implementation Phase - Server Actions
 */

'use server';

import { prisma } from '@/lib/db';
import { GeocodingService } from '@/lib/map/geocoding';
import { getCountryCenterCoordinates, isValidCoordinates } from '@/lib/map/utils';
import type {
  GeocodeResult,
  MapJob,
  MapJobsResponse,
  MapBounds,
  BackfillResult,
} from '@/lib/types/map';
import type { JobFilters } from '@/app/actions/jobs';

// ============================================================================
// GEOCODE JOB POSTING
// ============================================================================

export async function geocodeJobPosting(jobId: string): Promise<GeocodeResult> {
  try {
    // 1. Fetch job from database
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: {
        city: true,
        country: true,
        latitude: true,
        longitude: true,
        geocodedAt: true,
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // 2. Check if already geocoded
    if (isValidCoordinates(job.latitude, job.longitude) && job.geocodedAt) {
      return {
        latitude: job.latitude!,
        longitude: job.longitude!,
        confidence: 1.0, // Already geocoded
        cached: true,
      };
    }

    // 3. Call geocoding service
    const query = `${job.city}, ${job.country}`;
    const result = await GeocodingService.geocode(query);

    if (result) {
      // 4. Update database with coordinates
      await prisma.jobPosting.update({
        where: { id: jobId },
        data: {
          latitude: result.latitude,
          longitude: result.longitude,
          geocodedAt: new Date(),
          geocodeConfidence: result.confidence,
        },
      });

      return {
        ...result,
        cached: false,
      };
    } else {
      // Fallback: Use country center coordinates
      const countryCenter = getCountryCenterCoordinates(job.country);

      await prisma.jobPosting.update({
        where: { id: jobId },
        data: {
          latitude: countryCenter.lat,
          longitude: countryCenter.lng,
          geocodedAt: new Date(),
          geocodeConfidence: 0.3, // Low confidence fallback
        },
      });

      return {
        latitude: countryCenter.lat,
        longitude: countryCenter.lng,
        confidence: 0.3,
        cached: false,
        fallback: true,
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode job posting');
  }
}

// ============================================================================
// GET JOBS FOR MAP
// ============================================================================

export async function getJobsForMap(
  filters: JobFilters = {},
  bounds?: MapBounds
): Promise<MapJobsResponse> {
  try {
    // 1. Build where clause
    const where: any = {
      status: 'ACTIVE',
      latitude: { not: null },
      longitude: { not: null },
    };

    // 2. Apply standard filters
    if (filters.countries && filters.countries.length > 0) {
      where.country = { in: filters.countries };
    } else if (filters.country) {
      where.country = filters.country;
    }

    if (filters.subjects && filters.subjects.length > 0) {
      where.OR = filters.subjects.map((subject) => ({
        subject: { contains: subject, mode: 'insensitive' },
      }));
    } else if (filters.subject) {
      where.subject = { contains: filters.subject, mode: 'insensitive' };
    }

    if (filters.employmentTypes && filters.employmentTypes.length > 0) {
      where.employmentType = { in: filters.employmentTypes };
    }

    if (filters.minSalary !== undefined) {
      where.salaryUSD = { ...where.salaryUSD, gte: filters.minSalary };
    }

    if (filters.maxSalary !== undefined) {
      where.salaryUSD = { ...where.salaryUSD, lte: filters.maxSalary };
    }

    if (filters.housingProvided !== undefined) {
      where.housingProvided = filters.housingProvided;
    }

    if (filters.flightProvided !== undefined) {
      where.flightProvided = filters.flightProvided;
    }

    if (filters.minYearsExperience !== undefined) {
      where.minYearsExperience = { lte: filters.minYearsExperience };
    }

    // 3. Apply map bounds if provided
    if (bounds) {
      where.latitude = {
        gte: bounds.south,
        lte: bounds.north,
      };
      where.longitude = {
        gte: bounds.west,
        lte: bounds.east,
      };
    }

    // 4. Fetch jobs (limit to 1000 for performance)
    const jobs = await prisma.jobPosting.findMany({
      where,
      select: {
        id: true,
        title: true,
        schoolName: true,
        latitude: true,
        longitude: true,
        salaryUSD: true,
        housingProvided: true,
        flightProvided: true,
        country: true,
        city: true,
        subject: true,
        employmentType: true,
        createdAt: true,
      },
      take: 1000,
      orderBy: { createdAt: 'desc' },
    });

    // 5. Calculate total count
    const total = await prisma.jobPosting.count({ where });

    // 6. Calculate bounds from results
    const resultBounds = calculateResultBounds(jobs);

    return {
      jobs: jobs as MapJob[],
      total,
      bounds: bounds || resultBounds,
      truncated: total > 1000,
    };
  } catch (error) {
    console.error('Failed to fetch map jobs:', error);
    return {
      jobs: [],
      total: 0,
      bounds: bounds || {
        north: 90,
        south: -90,
        east: 180,
        west: -180,
      },
      truncated: false,
    };
  }
}

// ============================================================================
// BACKFILL COORDINATES
// ============================================================================

export async function backfillMissingCoordinates(): Promise<BackfillResult> {
  try {
    // 1. Find jobs without coordinates
    const jobsToGeocode = await prisma.jobPosting.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { latitude: null },
          { longitude: null },
          { geocodedAt: null },
        ],
      },
      select: { id: true, city: true, country: true },
      take: 100, // Limit to 100 jobs per run to avoid rate limits
    });

    console.log(`Found ${jobsToGeocode.length} jobs to geocode`);

    let successCount = 0;
    let failureCount = 0;
    const errors: Array<{ jobId: string; error: string }> = [];

    // 2. Geocode in batches
    for (const job of jobsToGeocode) {
      try {
        const result = await geocodeJobPosting(job.id);

        if (result.confidence > 0.5) {
          successCount++;
        } else {
          failureCount++;
        }

        // Rate limiting: 100ms delay between requests
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to geocode job ${job.id}:`, error);
        failureCount++;
        errors.push({
          jobId: job.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Progress logging every 10 jobs
      if ((successCount + failureCount) % 10 === 0) {
        console.log(`Progress: ${successCount + failureCount}/${jobsToGeocode.length}`);
      }
    }

    return {
      total: jobsToGeocode.length,
      success: successCount,
      failed: failureCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Backfill error:', error);
    throw new Error('Failed to backfill coordinates');
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateResultBounds(jobs: any[]): MapBounds {
  if (jobs.length === 0) {
    return {
      north: 90,
      south: -90,
      east: 180,
      west: -180,
    };
  }

  const validJobs = jobs.filter((j) => j.latitude && j.longitude);

  if (validJobs.length === 0) {
    return {
      north: 90,
      south: -90,
      east: 180,
      west: -180,
    };
  }

  const north = Math.max(...validJobs.map((j) => j.latitude));
  const south = Math.min(...validJobs.map((j) => j.latitude));
  const east = Math.max(...validJobs.map((j) => j.longitude));
  const west = Math.min(...validJobs.map((j) => j.longitude));

  // Add 10% padding
  const latPadding = (north - south) * 0.1 || 1;
  const lngPadding = (east - west) * 0.1 || 1;

  return {
    north: Math.min(90, north + latPadding),
    south: Math.max(-90, south - latPadding),
    east: Math.min(180, east + lngPadding),
    west: Math.max(-180, west - lngPadding),
  };
}
