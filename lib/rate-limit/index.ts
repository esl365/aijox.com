import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client (works with or without Upstash configured)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Rate limiters for different operations
 * Based on Refinement.md:414-478
 */

// Global rate limit: 10 requests per 10 seconds per user
export const userGlobalRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: '@ratelimit/user/global',
    })
  : null;

// Video analysis: 5 requests per hour (6th request blocked)
// Refinement.md:430 - "비디오 분석을 1시간 내 6번 요청 시 차단"
export const videoAnalysisRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: '@ratelimit/video-analysis',
    })
  : null;

// Job matching: 20 requests per hour per recruiter
export const jobMatchingRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      analytics: true,
      prefix: '@ratelimit/job-matching',
    })
  : null;

// Recruiter setup: 5 requests per hour (prevent spam account creation)
export const recruiterSetupRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: '@ratelimit/recruiter-setup',
    })
  : null;

/**
 * Helper function to check rate limit and return user-friendly error
 * Refinement.md:444 - "에러 메시지가 재시도 시간 표시하는지 확인"
 */
export async function checkRateLimit(
  rateLimit: Ratelimit | null,
  identifier: string,
  operationName: string
): Promise<{ success: true } | { success: false; error: string; retryAfter: number }> {
  // If Redis is not configured, allow all requests (development mode)
  if (!rateLimit) {
    console.warn(`Rate limiting disabled for ${operationName} - Redis not configured`);
    return { success: true };
  }

  const { success, limit, reset, remaining } = await rateLimit.limit(identifier);

  if (!success) {
    const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
    const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);

    let timeMessage: string;
    if (retryAfterSeconds < 60) {
      timeMessage = `${retryAfterSeconds}초`;
    } else if (retryAfterMinutes < 60) {
      timeMessage = `${retryAfterMinutes}분`;
    } else {
      const hours = Math.ceil(retryAfterMinutes / 60);
      timeMessage = `${hours}시간`;
    }

    return {
      success: false,
      error: `요청 한도를 초과했습니다. ${timeMessage} 후에 다시 시도해주세요. (남은 횟수: ${remaining}/${limit})`,
      retryAfter: retryAfterSeconds,
    };
  }

  return { success: true };
}

/* TODO: Fix after Upstash Ratelimit API update
 * These functions access protected 'prefix' property which is not allowed
 * Need to find alternative way to construct keys or use library methods
 *
 * Get rate limit status without consuming a token
 */
/*
export async function getRateLimitStatus(
  rateLimit: Ratelimit | null,
  identifier: string
): Promise<{
  limit: number;
  remaining: number;
  reset: number;
} | null> {
  if (!rateLimit || !redis) {
    return null;
  }

  // TODO: Cannot access rateLimit.prefix (protected property)
  // Need alternative approach to get key
  const key = `${rateLimit.prefix}:${identifier}`;
  const result = await redis.get<{
    limit: number;
    remaining: number;
    reset: number;
  }>(key);

  if (!result) {
    return {
      limit: 10,
      remaining: 10,
      reset: Date.now() + 10000,
    };
  }

  return result;
}
*/

/* TODO: Fix after Upstash Ratelimit API update
 * Manually reset rate limit for a user (admin function)
 */
/*
export async function resetRateLimit(
  rateLimit: Ratelimit | null,
  identifier: string
): Promise<void> {
  if (!rateLimit || !redis) {
    return;
  }

  // TODO: Cannot access rateLimit.prefix (protected property)
  const key = `${rateLimit.prefix}:${identifier}`;
  await redis.del(key);
}
*/
