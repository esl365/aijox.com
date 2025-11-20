import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { emailSchema } from '@/lib/validations/auth';

/**
 * Check if email is available for registration
 * GET /api/auth/check-email?email=user@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const validationResult = emailSchema.safeParse(email);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validationResult.data },
      select: { id: true },
    });

    return NextResponse.json({
      available: !existingUser,
      email: validationResult.data,
    });
  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    );
  }
}
