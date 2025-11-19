import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCachedMatches,
  cacheMatches,
  invalidateMatchCache,
  invalidateAllMatchCaches,
  recordCacheHit,
  recordCacheMiss,
  getCacheStats,
  resetCacheStats,
} from '@/lib/cache/match-cache';
import type { TeacherMatch } from '@/lib/db/vector-search';

// Mock Redis
vi.mock('@/lib/cache/redis', () => ({
  getCached: vi.fn(),
  setCached: vi.fn(),
  deleteCached: vi.fn(),
  deletePattern: vi.fn(),
  CACHE_TTL: {
    MATCH_RESULTS: 3600,
  },
  CACHE_PREFIX: {
    MATCHES: 'matches',
  },
}));

describe('Match Cache', () => {
  const mockMatches: TeacherMatch[] = [
    {
      id: 'teacher-1',
      userId: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      subjects: ['Math', 'Science'],
      yearsExperience: 5,
      citizenship: 'US',
      preferredCountries: ['China', 'Japan'],
      minSalaryUSD: 3000,
      videoAnalysis: null,
      visaStatus: null,
      similarity: 0.92,
      distance: 0.08,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    resetCacheStats();
  });

  describe('getCachedMatches', () => {
    it('should retrieve cached matches', async () => {
      const { getCached } = await import('@/lib/cache/redis');

      vi.mocked(getCached).mockResolvedValueOnce(mockMatches);

      const result = await getCachedMatches('job-123');

      expect(result).toEqual(mockMatches);
      expect(getCached).toHaveBeenCalledWith('matches:job-123');
    });

    it('should return null when cache miss', async () => {
      const { getCached } = await import('@/lib/cache/redis');

      vi.mocked(getCached).mockResolvedValueOnce(null);

      const result = await getCachedMatches('job-456');

      expect(result).toBeNull();
    });
  });

  describe('cacheMatches', () => {
    it('should cache match results with TTL', async () => {
      const { setCached } = await import('@/lib/cache/redis');

      await cacheMatches('job-123', mockMatches);

      expect(setCached).toHaveBeenCalledWith('matches:job-123', mockMatches, 3600);
    });
  });

  describe('invalidateMatchCache', () => {
    it('should delete specific job cache', async () => {
      const { deleteCached } = await import('@/lib/cache/redis');

      await invalidateMatchCache('job-123');

      expect(deleteCached).toHaveBeenCalledWith('matches:job-123');
    });
  });

  describe('invalidateAllMatchCaches', () => {
    it('should delete all match caches', async () => {
      const { deletePattern } = await import('@/lib/cache/redis');

      await invalidateAllMatchCaches();

      expect(deletePattern).toHaveBeenCalledWith('matches:*');
    });
  });

  describe('cache statistics', () => {
    it('should track cache hits and misses', () => {
      recordCacheHit();
      recordCacheHit();
      recordCacheMiss();

      const stats = getCacheStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(66.67);
    });

    it('should calculate 0% hit rate with no requests', () => {
      const stats = getCacheStats();

      expect(stats.hitRate).toBe(0);
    });

    it('should reset stats correctly', () => {
      recordCacheHit();
      recordCacheMiss();

      resetCacheStats();

      const stats = getCacheStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });
});
