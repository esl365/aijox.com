import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getVisaStatus } from '@/app/actions/visa-validation';
import { auth } from '@/lib/auth';

/**
 * Visa Validation API - Agent 3: Visa Guard
 * POST /api/validate-visa
 *
 * Request body:
 * {
 *   "teacherId": "string",
 *   "country": "string"
 * }
 *
 * Response:
 * {
 *   "eligible": boolean,
 *   "country": "string",
 *   "visaType": "string",
 *   "failedRequirements": string[],
 *   "disqualifications": string[],
 *   "confidence": number
 * }
 */

const requestSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  country: z.string().min(1, 'Country is required'),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { teacherId, country } = validationResult.data;

    // 2. Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Please sign in to continue.',
        },
        { status: 401 }
      );
    }

    // 3. Call existing server action
    const result = await getVisaStatus(teacherId, country);

    if (!result) {
      return NextResponse.json(
        {
          error: 'Teacher not found',
          message: 'Teacher profile does not exist.',
        },
        { status: 404 }
      );
    }

    // 4. Return response matching spec format
    return NextResponse.json({
      eligible: result.eligible,
      country: result.country,
      visaType: result.visaType,
      failedRequirements: result.failedRequirements?.map((r: any) => r.message) || [],
      disqualifications: result.disqualifications || [],
      confidence: result.confidence,
      cached: result.cached,
      ...(result.cached && result.cachedAt ? { cachedAt: result.cachedAt } : {}),
    });
  } catch (error: any) {
    console.error('Visa validation API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message || 'Failed to validate visa eligibility',
      },
      { status: 500 }
    );
  }
}
