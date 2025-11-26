/**
 * Rate Limiting Implementation
 *
 * Uses Upstash Redis for distributed rate limiting across serverless functions.
 * Protects AI-intensive operations from abuse and excessive costs.
 *
 * Refinement.md:518-556 - Added rate limiting to prevent API abuse
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client (only if environment variables are set)
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  } else {
    console.warn('⚠️ Rate limiting disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set');
  }
} catch (error) {
  console.error('Failed to initialize Redis for rate limiting:', error);
}

/**
 * Rate Limiters for Different Operations
 */

// Video Analysis: 5 requests per hour (expensive AI operation)
export const videoAnalysisRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: 'ratelimit:video-analysis',
    })
  : null;

// Email Generation: 20 emails per 10 minutes (prevent spam)
export const emailGenerationRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '10 m'),
      analytics: true,
      prefix: 'ratelimit:email-generation',
    })
  : null;

// Job Matching: 10 requests per minute (vector search intensive)
export const jobMatchingRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'ratelimit:job-matching',
    })
  : null;

// Server Actions (General): 100 requests per minute per user
export const generalRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:general',
    })
  : null;

// API Routes (Public): 100 requests per minute per IP
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:api',
    })
  : null;

/**
 * Check rate limit for a specific operation
 *
 * @param limiter - The rate limiter to use
 * @param identifier - Unique identifier (userId, IP address, etc.)
 * @param operationType - Human-readable operation type for error messages
 * @returns Result with success status and error message if rate limited
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
  operationType: string = 'this action'
): Promise<{ success: boolean; error?: string; remaining?: number; reset?: number }> {
  // If rate limiter is not configured, allow all requests
  if (!limiter) {
    console.warn(`⚠️ Rate limiter not configured for ${operationType}, allowing request`);
    return { success: true };
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      const resetDate = new Date(reset);
      const minutesUntilReset = Math.ceil((reset - Date.now()) / 1000 / 60);

      return {
        success: false,
        error: `Rate limit exceeded for ${operationType}. Please try again in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`,
        remaining: 0,
        reset
      };
    }

    return {
      success: true,
      remaining,
      reset
    };
  } catch (error) {
    // On rate limiter failure, log error but allow request (fail open)
    console.error(`Rate limiter error for ${operationType}:`, error);
    return { success: true };
  }
}

/**
 * Check rate limit for API routes (using IP address)
 *
 * @param request - Next.js Request object
 * @returns Result with success status
 */
export async function checkApiRateLimit(request: Request): Promise<{
  success: boolean;
  error?: string;
  headers?: Record<string, string>;
}> {
  // Extract IP address from request
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

  const result = await checkRateLimit(apiRateLimit, ip, 'API requests');

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.reset?.toString() || '',
      }
    };
  }

  return {
    success: true,
    headers: {
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': result.remaining?.toString() || '',
      'X-RateLimit-Reset': result.reset?.toString() || '',
    }
  };
}

/**
 * Middleware helper to apply rate limiting
 *
 * Usage in API routes:
 * ```typescript
 * export async function POST(request: Request) {
 *   const rateLimitResult = await checkApiRateLimit(request);
 *   if (!rateLimitResult.success) {
 *     return NextResponse.json(
 *       { error: rateLimitResult.error },
 *       { status: 429, headers: rateLimitResult.headers }
 *     );
 *   }
 *   // Continue with request...
 * }
 * ```
 */
export function createRateLimitMiddleware(limiter: Ratelimit | null, operationType: string) {
  return async (identifier: string) => {
    const result = await checkRateLimit(limiter, identifier, operationType);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result;
  };
}

/**
 * Get rate limit status without consuming a token
 * Useful for displaying remaining requests to users
 */
export async function getRateLimitStatus(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ remaining: number; reset: number } | null> {
  if (!limiter || !redis) {
    return null;
  }

  try {
    // Check current limit without consuming
    const key = `${limiter['prefix']}:${identifier}`;
    const data = await redis.get(key);

    if (!data) {
      return null; // No rate limit data yet
    }

    // Parse rate limit data
    // Note: This is a simplified version, actual implementation depends on Upstash internals
    return {
      remaining: 0, // Would need to parse from data
      reset: Date.now() + 60000 // Placeholder
    };
  } catch (error) {
    console.error('Failed to get rate limit status:', error);
    return null;
  }
}
