/**
 * Geocoding service wrapper
 * SPARC: Implementation Phase - External API Integration
 */

import { OpenCageResponse } from '@/lib/types/map';
import { retryAsync } from './utils';

const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;
const OPENCAGE_BASE_URL = 'https://api.opencagedata.com/geocode/v1/json';

// ============================================================================
// Geocoding Service
// ============================================================================

export class GeocodingService {
  /**
   * Geocode a location (city + country)
   */
  static async geocode(query: string): Promise<{
    latitude: number;
    longitude: number;
    confidence: number;
  } | null> {
    if (!OPENCAGE_API_KEY) {
      console.error('OPENCAGE_API_KEY not configured');
      return null;
    }

    try {
      const result = await retryAsync(
        async () => {
          const url = new URL(OPENCAGE_BASE_URL);
          url.searchParams.set('q', query);
          url.searchParams.set('key', OPENCAGE_API_KEY!);
          url.searchParams.set('limit', '1');
          url.searchParams.set('no_annotations', '1');

          const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              'User-Agent': 'Global Educator Nexus/1.0',
            },
          });

          if (!response.ok) {
            if (response.status === 429) {
              throw new Error('Rate limit exceeded');
            }
            throw new Error(`Geocoding API error: ${response.status}`);
          }

          const data: OpenCageResponse = await response.json();

          if (data.results.length === 0) {
            return null;
          }

          const result = data.results[0];

          return {
            latitude: result.geometry.lat,
            longitude: result.geometry.lng,
            confidence: result.confidence / 10, // Convert 0-10 to 0-1
          };
        },
        3, // Max retries
        1000 // Initial delay
      );

      return result;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Batch geocode multiple locations
   * Respects rate limits (10 requests/second max)
   */
  static async batchGeocode(
    queries: string[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<Array<{
    query: string;
    result: {
      latitude: number;
      longitude: number;
      confidence: number;
    } | null;
  }>> {
    const results: Array<{
      query: string;
      result: {
        latitude: number;
        longitude: number;
        confidence: number;
      } | null;
    }> = [];

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      const result = await this.geocode(query);

      results.push({ query, result });

      // Rate limiting: 100ms delay between requests (10 req/sec max)
      if (i < queries.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Progress callback
      if (onProgress) {
        onProgress(i + 1, queries.length);
      }
    }

    return results;
  }
}

// ============================================================================
// Geocoding Cache
// ============================================================================

/**
 * In-memory cache for geocoding results
 * Reduces API calls during development
 */
class GeocodeCache {
  private cache = new Map<string, {
    latitude: number;
    longitude: number;
    confidence: number;
    timestamp: number;
  }>();

  private TTL = 24 * 60 * 60 * 1000; // 24 hours

  get(query: string) {
    const cached = this.cache.get(query);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(query);
      return null;
    }

    return {
      latitude: cached.latitude,
      longitude: cached.longitude,
      confidence: cached.confidence,
    };
  }

  set(query: string, result: {
    latitude: number;
    longitude: number;
    confidence: number;
  }) {
    this.cache.set(query, {
      ...result,
      timestamp: Date.now(),
    });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const geocodeCache = new GeocodeCache();
