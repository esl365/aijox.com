/**
 * API Route for Map View
 * SPARC: Implementation Phase - API Routes
 *
 * GET /api/jobs/map - Fetch jobs with coordinates for map visualization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJobsForMap } from '@/app/actions/map';
import { isValidBounds } from '@/lib/map/server-utils';
import type { JobFilters } from '@/app/actions/jobs';
import type { MapBounds } from '@/lib/types/map';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ============================================================================
// GET - Fetch jobs for map
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query parameters
    const filters: JobFilters = {};

    // Countries (comma-separated)
    const countries = searchParams.get('countries');
    if (countries) {
      filters.countries = countries.split(',').filter(Boolean);
    }

    // Subjects (comma-separated)
    const subjects = searchParams.get('subjects');
    if (subjects) {
      filters.subjects = subjects.split(',').filter(Boolean);
    }

    // Employment types (comma-separated)
    const employmentTypes = searchParams.get('employmentTypes');
    if (employmentTypes) {
      filters.employmentTypes = employmentTypes.split(',').filter(Boolean);
    }

    // Salary range
    const minSalary = searchParams.get('minSalary');
    if (minSalary) {
      const parsed = Number(minSalary);
      if (!isNaN(parsed)) {
        filters.minSalary = parsed;
      }
    }

    const maxSalary = searchParams.get('maxSalary');
    if (maxSalary) {
      const parsed = Number(maxSalary);
      if (!isNaN(parsed)) {
        filters.maxSalary = parsed;
      }
    }

    // Benefits
    const housingProvided = searchParams.get('housingProvided');
    if (housingProvided === 'true') {
      filters.housingProvided = true;
    }

    const flightProvided = searchParams.get('flightProvided');
    if (flightProvided === 'true') {
      filters.flightProvided = true;
    }

    // Experience
    const minYearsExperience = searchParams.get('minYearsExperience');
    if (minYearsExperience) {
      const parsed = Number(minYearsExperience);
      if (!isNaN(parsed)) {
        filters.minYearsExperience = parsed;
      }
    }

    // Parse map bounds if provided
    let bounds: MapBounds | undefined;
    const boundsParam = searchParams.get('bounds');
    if (boundsParam) {
      try {
        const parsed = JSON.parse(boundsParam);
        bounds = {
          north: Number(parsed.north),
          south: Number(parsed.south),
          east: Number(parsed.east),
          west: Number(parsed.west),
        };

        // Validate bounds
        if (!isValidBounds(bounds)) {
          return NextResponse.json(
            { error: 'Invalid map bounds provided' },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to parse bounds parameter' },
          { status: 400 }
        );
      }
    }

    // Fetch jobs
    const result = await getJobsForMap(filters, bounds);

    // Return with caching headers
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Map API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch map data' },
      { status: 500 }
    );
  }
}
