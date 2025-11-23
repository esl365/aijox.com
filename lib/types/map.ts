/**
 * Type definitions for Map View feature
 * SPARC: Implementation Phase - Type Definitions
 */

import { JobPosting } from '@prisma/client';

// ============================================================================
// Map Bounds
// ============================================================================

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

// ============================================================================
// Geocoding
// ============================================================================

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  confidence: number;
  cached: boolean;
  fallback?: boolean;
};

export type GeocodeRequest = {
  jobId: string;
  city: string;
  country: string;
};

// ============================================================================
// Map Job Data
// ============================================================================

export type MapJob = Pick<
  JobPosting,
  | 'id'
  | 'title'
  | 'schoolName'
  | 'latitude'
  | 'longitude'
  | 'salaryUSD'
  | 'housingProvided'
  | 'flightProvided'
  | 'country'
  | 'city'
  | 'subject'
  | 'employmentType'
  | 'createdAt'
>;

// ============================================================================
// API Responses
// ============================================================================

export type MapJobsResponse = {
  jobs: MapJob[];
  total: number;
  bounds: MapBounds;
  truncated: boolean;
};

export type BackfillResult = {
  total: number;
  success: number;
  failed: number;
  errors?: Array<{ jobId: string; error: string }>;
};

// ============================================================================
// Component Props
// ============================================================================

export type JobMapProps = {
  initialJobs: MapJob[];
  filters: Record<string, any>;
  onJobSelect?: (jobId: string) => void;
};

export type JobViewToggleProps = {
  view: 'list' | 'map';
  onChange: (view: 'list' | 'map') => void;
  jobCount?: number;
};

export type JobPreviewCardProps = {
  job: MapJob;
  onClose?: () => void;
  className?: string;
};

// ============================================================================
// Map State
// ============================================================================

export type MapState = {
  center: [number, number];
  zoom: number;
  bounds: MapBounds | null;
  selectedJobId: string | null;
  searchThisArea: boolean;
};

// ============================================================================
// Cluster Configuration
// ============================================================================

export type ClusterConfig = {
  maxClusterRadius: number;
  disableClusteringAtZoom: number;
  spiderfyOnMaxZoom: boolean;
  showCoverageOnHover: boolean;
  zoomToBoundsOnClick: boolean;
};

// ============================================================================
// OpenCage API Types
// ============================================================================

export type OpenCageResponse = {
  results: Array<{
    geometry: {
      lat: number;
      lng: number;
    };
    confidence: number;
    formatted: string;
    components: {
      city?: string;
      country?: string;
      country_code?: string;
    };
  }>;
  status: {
    code: number;
    message: string;
  };
  rate: {
    limit: number;
    remaining: number;
    reset: number;
  };
};

// ============================================================================
// Country Center Coordinates
// ============================================================================

export type CountryCoordinates = {
  lat: number;
  lng: number;
  name: string;
};

export const COUNTRY_CENTERS: Record<string, CountryCoordinates> = {
  'South Korea': { lat: 37.5665, lng: 126.978, name: 'Seoul' },
  'Japan': { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
  'China': { lat: 39.9042, lng: 116.4074, name: 'Beijing' },
  'United Arab Emirates': { lat: 25.2048, lng: 55.2708, name: 'Dubai' },
  'Saudi Arabia': { lat: 24.7136, lng: 46.6753, name: 'Riyadh' },
  'Vietnam': { lat: 21.0285, lng: 105.8542, name: 'Hanoi' },
  'Thailand': { lat: 13.7563, lng: 100.5018, name: 'Bangkok' },
  'Taiwan': { lat: 25.033, lng: 121.5654, name: 'Taipei' },
  'Singapore': { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
  'Hong Kong': { lat: 22.3193, lng: 114.1694, name: 'Hong Kong' },
  'Malaysia': { lat: 3.139, lng: 101.6869, name: 'Kuala Lumpur' },
  'Indonesia': { lat: -6.2088, lng: 106.8456, name: 'Jakarta' },
  'Philippines': { lat: 14.5995, lng: 120.9842, name: 'Manila' },
  'Kuwait': { lat: 29.3759, lng: 47.9774, name: 'Kuwait City' },
  'Qatar': { lat: 25.2854, lng: 51.531, name: 'Doha' },
  'Oman': { lat: 23.588, lng: 58.3829, name: 'Muscat' },
  'Bahrain': { lat: 26.0667, lng: 50.5577, name: 'Manama' },
  'Jordan': { lat: 31.9454, lng: 35.9284, name: 'Amman' },
  'Turkey': { lat: 39.9334, lng: 32.8597, name: 'Ankara' },
  'Egypt': { lat: 30.0444, lng: 31.2357, name: 'Cairo' },
};

// ============================================================================
// Map Configuration
// ============================================================================

export const MAP_CONFIG = {
  DEFAULT_CENTER: [20, 0] as [number, number], // World center
  DEFAULT_ZOOM: 2,
  MIN_ZOOM: 2,
  MAX_ZOOM: 18,
  CLUSTER_RADIUS: 50,
  MAX_MARKERS: 1000,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
} as const;

// ============================================================================
// Cluster Colors
// ============================================================================

export const CLUSTER_COLORS = {
  SMALL: '#60A5FA', // 2-10 jobs: Light blue
  MEDIUM: '#3B82F6', // 11-50 jobs: Blue
  LARGE: '#1E40AF', // 51-100 jobs: Dark blue
  XLARGE: '#7C3AED', // 100+ jobs: Purple
} as const;

export function getClusterColor(count: number): string {
  if (count <= 10) return CLUSTER_COLORS.SMALL;
  if (count <= 50) return CLUSTER_COLORS.MEDIUM;
  if (count <= 100) return CLUSTER_COLORS.LARGE;
  return CLUSTER_COLORS.XLARGE;
}

export function getClusterSize(count: number): 'small' | 'medium' | 'large' | 'xlarge' {
  if (count <= 10) return 'small';
  if (count <= 50) return 'medium';
  if (count <= 100) return 'large';
  return 'xlarge';
}
