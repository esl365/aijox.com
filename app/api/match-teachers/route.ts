import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { notifyMatchedTeachers } from '@/app/actions/match-teachers';
import { auth } from '@/lib/auth';
import { SCORING_CONFIG } from '@/lib/config/scoring';

/**
 * Job Matching API - Agent 2: Autonomous Headhunter
 * POST /api/match-teachers
 *
 * Request body:
 * {
 *   "jobId": "string",
 *   "limit": number,          // default: 20, max: 100
 *   "minSimilarity": number   // default: 0.85
 * }
 *
 * Response:
 * {
 *   "success": boolean,
 *   "matches": MatchedTeacher[],
 *   "totalMatches": number,
 *   "processingTime": number
 * }
 */

const requestSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(SCORING_CONFIG.MATCHING.DEFAULT_MAX_CANDIDATES),
  minSimilarity: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .default(SCORING_CONFIG.MATCHING.DEFAULT_MIN_SIMILARITY),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Parse request body
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { jobId, limit, minSimilarity } = validationResult.data;

    // 2. Authentication check (recruiter only)
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Please sign in to continue.',
        },
        { status: 401 }
      );
    }

    if (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Only recruiters can access job matching.',
        },
        { status: 403 }
      );
    }

    // 3. Call existing server action
    const result = await notifyMatchedTeachers(jobId, {
      maxCandidates: limit,
      minSimilarity,
      sendImmediately: true,
    });

    // 4. Calculate processing time
    const processingTime = Date.now() - startTime;

    // 5. Return response matching spec format
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: result.message,
          processingTime,
        },
        { status: result.error === 'Job not found' ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      totalMatches: result.stats?.totalMatches || 0,
      afterFiltering: result.stats?.afterFiltering || 0,
      emailsSent: result.stats?.emailsSent || 0,
      failed: result.stats?.failed || 0,
      processingTime,
    });
  } catch (error: any) {
    console.error('Job matching API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to process job matches',
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
