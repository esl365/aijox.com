import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { generalRateLimit, checkRateLimit } from '@/lib/rate-limit';

const recruiterSetupSchema = z.object({
  userId: z.string(),
  companyName: z.string().min(2),
  companyWebsite: z.string().url().optional().or(z.literal('')),
  position: z.string().min(2),
  phone: z.string().optional(),
  bio: z.string().min(50).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Rate limiting: 100 requests per minute to prevent spam (Refinement.md:416)
    const rateLimitResult = await checkRateLimit(
      generalRateLimit,
      session.user.id,
      'recruiter-setup'
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: rateLimitResult.error || 'Too many requests',
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = recruiterSetupSchema.parse(body);

    if (validatedData.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update user name with company name
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.companyName,
      },
    });

    // Store additional recruiter data in metadata or separate table
    // For now, we'll just mark the profile as complete
    // You can extend this to create a Recruiter table if needed

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Recruiter setup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
