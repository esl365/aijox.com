/**
 * Server-safe Map Utilities
 * SPARC: Implementation Phase - Server Utilities
 *
 * These utilities can be used in both server and client contexts
 * (no browser-specific APIs like window, Leaflet, etc.)
 */

import { MapBounds, MapJob, COUNTRY_CENTERS, CountryCoordinates } from '@/lib/types/map';
import type { JobFilters } from '@/app/actions/jobs';

// ============================================================================
// Bounds Utilities
// ============================================================================

/**
 * Calculate bounding box for array of jobs
 */
export function calculateBounds(jobs: MapJob[]): MapBounds {
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

  const north = Math.max(...validJobs.map((j) => j.latitude!));
  const south = Math.min(...validJobs.map((j) => j.latitude!));
  const east = Math.max(...validJobs.map((j) => j.longitude!));
  const west = Math.min(...validJobs.map((j) => j.longitude!));

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

/**
 * Validate map bounds
 */
export function isValidBounds(bounds: MapBounds): boolean {
  return (
    typeof bounds.north === 'number' &&
    typeof bounds.south === 'number' &&
    typeof bounds.east === 'number' &&
    typeof bounds.west === 'number' &&
    bounds.north >= -90 &&
    bounds.north <= 90 &&
    bounds.south >= -90 &&
    bounds.south <= 90 &&
    bounds.east >= -180 &&
    bounds.east <= 180 &&
    bounds.west >= -180 &&
    bounds.west <= 180 &&
    bounds.north > bounds.south &&
    bounds.east > bounds.west
  );
}

/**
 * Convert Leaflet LatLngBounds to our MapBounds format
 */
export function leafletBoundsToMapBounds(bounds: any): MapBounds {
  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
}

// ============================================================================
// Geocoding Utilities
// ============================================================================

/**
 * Get country center coordinates
 */
export function getCountryCenterCoordinates(country: string): CountryCoordinates | null {
  return COUNTRY_CENTERS[country] || null;
}

/**
 * Format location query for geocoding
 */
export function formatLocationQuery(city: string, country: string): string {
  return `${city}, ${country}`;
}

// ============================================================================
// Distance Utilities
// ============================================================================

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// ============================================================================
// API URL Builder
// ============================================================================

/**
 * Build API URL for fetching map jobs
 */
export function buildMapApiUrl(filters: JobFilters, bounds?: MapBounds): string {
  const params = new URLSearchParams();

  // Add filters
  if (filters.countries && filters.countries.length > 0) {
    params.set('countries', filters.countries.join(','));
  }
  if (filters.subjects && filters.subjects.length > 0) {
    params.set('subjects', filters.subjects.join(','));
  }
  if (filters.employmentTypes && filters.employmentTypes.length > 0) {
    params.set('employmentTypes', filters.employmentTypes.join(','));
  }
  if (filters.minSalary !== undefined) {
    params.set('minSalary', filters.minSalary.toString());
  }
  if (filters.maxSalary !== undefined) {
    params.set('maxSalary', filters.maxSalary.toString());
  }
  if (filters.housingProvided) {
    params.set('housingProvided', 'true');
  }
  if (filters.flightProvided) {
    params.set('flightProvided', 'true');
  }
  if (filters.minYearsExperience !== undefined) {
    params.set('minYearsExperience', filters.minYearsExperience.toString());
  }

  // Add bounds if provided
  if (bounds) {
    params.set('bounds', JSON.stringify(bounds));
  }

  return `/api/jobs/map?${params.toString()}`;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(lat?: number | null, lng?: number | null): boolean {
  return (
    lat !== null &&
    lat !== undefined &&
    lng !== null &&
    lng !== undefined &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
