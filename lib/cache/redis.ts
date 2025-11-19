/**
 * Redis Cache Configuration
 * Refinement.md:160-174
 *
 * Uses Upstash Redis for caching expensive operations
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client (reuses the same instance as rate limiting)
export const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Cache TTL (Time To Live) configurations
 */
export const CACHE_TTL = {
  MATCH_RESULTS: 3600,        // 1 hour - job matching results
  JOB_EMBEDDING: 86400,       // 24 hours - job embeddings rarely change
  TEACHER_EMBEDDING: 604800,  // 7 days - teacher profiles stable
  VISA_STATUS: 2592000,       // 30 days - visa rules don't change often
} as const;

/**
 * Cache key prefixes for organization
 */
export const CACHE_PREFIX = {
  MATCHES: 'matches',
  JOB_EMBEDDING: 'job-embed',
  TEACHER_EMBEDDING: 'teacher-embed',
  VISA_STATUS: 'visa',
} as const;

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redis !== null;
}

/**
 * Generic cache get with logging
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) {
    console.warn('[CACHE] Redis not configured - cache disabled');
    return null;
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached) {
      console.log(`[CACHE HIT] ${key}`);
      return cached;
    }
    console.log(`[CACHE MISS] ${key}`);
    return null;
  } catch (error) {
    console.error(`[CACHE ERROR] Failed to get ${key}:`, error);
    return null;
  }
}

/**
 * Generic cache set with logging
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  if (!redis) {
    console.warn('[CACHE] Redis not configured - skipping cache set');
    return;
  }

  try {
    await redis.setex(key, ttlSeconds, value);
    console.log(`[CACHE SET] ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    console.error(`[CACHE ERROR] Failed to set ${key}:`, error);
  }
}

/**
 * Delete cache entry
 */
export async function deleteCached(key: string): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    await redis.del(key);
    console.log(`[CACHE DELETE] ${key}`);
  } catch (error) {
    console.error(`[CACHE ERROR] Failed to delete ${key}:`, error);
  }
}

/**
 * Delete all cache entries matching a pattern
 */
export async function deletePattern(pattern: string): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    // Note: Upstash Redis doesn't support SCAN, so we use keys
    // This is acceptable for patterns with limited matches
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map(key => redis.del(key)));
      console.log(`[CACHE DELETE PATTERN] ${pattern} (${keys.length} keys)`);
    }
  } catch (error) {
    console.error(`[CACHE ERROR] Failed to delete pattern ${pattern}:`, error);
  }
}
