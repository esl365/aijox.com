/**
 * Client-only Map Utilities
 * SPARC: Implementation Phase - Client Utilities
 *
 * These utilities require Leaflet and browser APIs
 * DO NOT import this in server components or API routes
 */

import L from 'leaflet';
import { MapJob, getClusterColor, getClusterSize } from '@/lib/types/map';

// Re-export all server-safe utilities
export * from './server-utils';

// ============================================================================
// Leaflet Icon Utilities (Client-only)
// ============================================================================

/**
 * Create custom cluster icon based on count
 * (Requires Leaflet - client-only)
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
 * (Requires Leaflet - client-only)
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
// localStorage Utilities (Client-only)
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
// Helper Utilities
// ============================================================================

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
