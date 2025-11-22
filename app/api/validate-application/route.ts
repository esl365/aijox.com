import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateJobApplication } from '@/app/actions/visa-validation';
import { auth } from '@/lib/auth';

/**
 * Application Validation API - Agent 3: Visa Guard
 * POST /api/validate-application
 *
 * Request body:
 * {
 *   "teacherId": "string",
 *   "jobId": "string"
 * }
 *
 * Response:
 * {
 *   "canApply": boolean,
 *   "reason"?: string,
 *   "checks": {
 *     "visaEligible": boolean,
 *     "experienceMatch": boolean,
 *     "subjectMatch": boolean,
 *     "salaryMatch": boolean
 *   }
 * }
 */

const requestSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  jobId: z.string().min(1, 'Job ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          canApply: false,
          error: 'Validation failed',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { teacherId, jobId } = validationResult.data;

    // 2. Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          canApply: false,
          error: 'Unauthorized',
          message: 'Please sign in to continue.',
          checks: {
            visaEligible: false,
            experienceMatch: false,
            subjectMatch: false,
            salaryMatch: false,
          },
        },
        { status: 401 }
      );
    }

    // 3. Call existing server action
    const result = await validateJobApplication(teacherId, jobId);

    // 4. Return response matching spec format
    return NextResponse.json({
      canApply: result.canApply,
      reason: result.reason,
      checks: result.checks,
      visaDetails: result.visaDetails,
    });
  } catch (error: any) {
    console.error('Application validation API error:', error);

    return NextResponse.json(
      {
        canApply: false,
        error: 'Internal server error',
        message: error.message || 'Failed to validate application',
        checks: {
          visaEligible: false,
          experienceMatch: false,
          subjectMatch: false,
          salaryMatch: false,
        },
      },
      { status: 500 }
    );
  }
}
