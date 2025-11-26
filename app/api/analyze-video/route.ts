import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeTeacherVideo } from '@/app/actions/analyze-video';
import { auth } from '@/lib/auth';
import { checkApiRateLimit } from '@/lib/rate-limit';

/**
 * Video Analysis API - Agent 1: AI Screener
 * POST /api/analyze-video
 *
 * Request body:
 * {
 *   "profileId": "string",
 *   "videoUrl": "string" // Optional - for compat with spec
 * }
 *
 * Response:
 * {
 *   "success": boolean,
 *   "analysis": VideoAnalysis,
 *   "processingTime": number
 * }
 */

const requestSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  videoUrl: z.string().url().optional(), // Included for spec compatibility
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 0. Rate limiting check
    const rateLimitResult = await checkApiRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: rateLimitResult.error,
        },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

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

    const { profileId } = validationResult.data;

    // 2. Authentication check (optional - server action also checks)
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

    // 3. Call existing server action
    const result = await analyzeTeacherVideo(profileId);

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
        { status: result.error === 'Profile not found' ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      message: result.message,
      processingTime,
    });
  } catch (error: any) {
    console.error('Video analysis API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to analyze video',
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
