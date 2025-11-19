/**
 * Job Matching Cache
 * Refinement.md:160-174
 *
 * Caches expensive vector search results
 */

import { getCached, setCached, deleteCached, deletePattern, CACHE_TTL, CACHE_PREFIX } from './redis';
import type { TeacherMatch } from '@/lib/db/vector-search';

/**
 * Get cached job matching results
 */
export async function getCachedMatches(jobId: string): Promise<TeacherMatch[] | null> {
  const cacheKey = `${CACHE_PREFIX.MATCHES}:${jobId}`;
  return getCached<TeacherMatch[]>(cacheKey);
}

/**
 * Cache job matching results
 */
export async function cacheMatches(
  jobId: string,
  matches: TeacherMatch[]
): Promise<void> {
  const cacheKey = `${CACHE_PREFIX.MATCHES}:${jobId}`;
  await setCached(cacheKey, matches, CACHE_TTL.MATCH_RESULTS);
}

/**
 * Invalidate cache for a specific job
 * Call this when:
 * - Job posting is updated
 * - Job is deleted
 * - Teacher profiles change significantly
 */
export async function invalidateMatchCache(jobId: string): Promise<void> {
  const cacheKey = `${CACHE_PREFIX.MATCHES}:${jobId}`;
  await deleteCached(cacheKey);
}

/**
 * Invalidate all match caches
 * Call this when:
 * - Matching algorithm changes
 * - Filters are updated
 * - Mass teacher profile updates
 */
export async function invalidateAllMatchCaches(): Promise<void> {
  const pattern = `${CACHE_PREFIX.MATCHES}:*`;
  await deletePattern(pattern);
}

/**
 * Get cache statistics (for monitoring)
 */
export type CacheStats = {
  hits: number;
  misses: number;
  hitRate: number;
};

let cacheHits = 0;
let cacheMisses = 0;

export function recordCacheHit(): void {
  cacheHits++;
}

export function recordCacheMiss(): void {
  cacheMisses++;
}

export function getCacheStats(): CacheStats {
  const total = cacheHits + cacheMisses;
  const hitRate = total > 0 ? (cacheHits / total) * 100 : 0;

  return {
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: Number(hitRate.toFixed(2)),
  };
}

export function resetCacheStats(): void {
  cacheHits = 0;
  cacheMisses = 0;
}
