/**
 * Map utility functions
 * SPARC: Implementation Phase - Utilities
 */

import L from 'leaflet';
import {
  MapBounds,
  MapJob,
  COUNTRY_CENTERS,
  CountryCoordinates,
  getClusterColor,
  getClusterSize,
} from '@/lib/types/map';

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
 * Validate map bounds are within acceptable range
 */
export function isValidBounds(bounds: MapBounds): boolean {
  return (
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
 * Convert Leaflet LatLngBounds to MapBounds
 */
export function leafletBoundsToMapBounds(bounds: L.LatLngBounds): MapBounds {
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
 * Get fallback coordinates for a country
 */
export function getCountryCenterCoordinates(country: string): CountryCoordinates {
  const normalized = country.trim();
  return (
    COUNTRY_CENTERS[normalized] || {
      lat: 0,
      lng: 0,
      name: 'Unknown',
    }
  );
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

// ============================================================================
// Marker Icon Creation
// ============================================================================

/**
 * Create custom cluster icon
 */
export function createClusterIcon(cluster: any): L.DivIcon {
  const count = cluster.getChildCount();
  const color = getClusterColor(count);
  const size = getClusterSize(count);

  const sizeMap = {
    small: 40,
    medium: 50,
    large: 60,
    xlarge: 70,
  };

  const iconSize = sizeMap[size];

  return L.divIcon({
    html: `
      <div class="custom-cluster-icon" style="
        background-color: ${color};
        width: ${iconSize}px;
        height: ${iconSize}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: ${size === 'xlarge' ? '18px' : '14px'};
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 3px solid white;
      ">
        <span>${count}</span>
      </div>
    `,
    className: 'custom-cluster-marker',
    iconSize: L.point(iconSize, iconSize),
  });
}

/**
 * Create custom job marker icon
 */
export function createJobIcon(job?: MapJob): L.DivIcon {
  return L.divIcon({
    html: `
      <div class="custom-job-icon" style="
        background-color: #3B82F6;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 2px solid white;
      ">
        <div style="transform: rotate(45deg); font-size: 16px;">📍</div>
      </div>
    `,
    className: 'custom-job-marker',
    iconSize: L.point(32, 32),
    iconAnchor: L.point(16, 32),
    popupAnchor: L.point(0, -32),
  });
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
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  } else if (km < 100) {
    return `${km.toFixed(1)}km`;
  } else {
    return `${Math.round(km)}km`;
  }
}

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * Build map API URL with filters and bounds
 */
export function buildMapApiUrl(
  filters: Record<string, any>,
  bounds?: MapBounds
): string {
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
  if (filters.minSalary) {
    params.set('minSalary', filters.minSalary.toString());
  }
  if (filters.maxSalary) {
    params.set('maxSalary', filters.maxSalary.toString());
  }
  if (filters.housingProvided !== undefined) {
    params.set('housingProvided', filters.housingProvided.toString());
  }
  if (filters.flightProvided !== undefined) {
    params.set('flightProvided', filters.flightProvided.toString());
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
// localStorage Utilities
// ============================================================================

const MAP_VIEW_STORAGE_KEY = 'jobs-view-preference';
const MAP_STATE_STORAGE_KEY = 'jobs-map-state';

/**
 * Get user's preferred view (list or map)
 */
export function getViewPreference(): 'list' | 'map' {
  if (typeof window === 'undefined') return 'list';

  try {
    const preference = localStorage.getItem(MAP_VIEW_STORAGE_KEY);
    return preference === 'map' ? 'map' : 'list';
  } catch {
    return 'list';
  }
}

/**
 * Save user's preferred view
 */
export function setViewPreference(view: 'list' | 'map'): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(MAP_VIEW_STORAGE_KEY, view);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get saved map state (center, zoom)
 */
export function getSavedMapState(): { center: [number, number]; zoom: number } | null {
  if (typeof window === 'undefined') return null;

  try {
    const state = localStorage.getItem(MAP_STATE_STORAGE_KEY);
    return state ? JSON.parse(state) : null;
  } catch {
    return null;
  }
}

/**
 * Save map state (center, zoom)
 */
export function saveMapState(center: [number, number], zoom: number): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      MAP_STATE_STORAGE_KEY,
      JSON.stringify({ center, zoom })
    );
  } catch {
    // Ignore localStorage errors
  }
}

// ============================================================================
// Debounce Utility
// ============================================================================

/**
 * Debounce function for map move events
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

// ============================================================================
// Retry Utility
// ============================================================================

/**
 * Retry async function with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        // Exponential backoff: delay * 2^i
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
