import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signupSchema } from '@/lib/validations/auth';

/**
 * User registration endpoint
 * POST /api/auth/signup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, role, marketing } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role,
      },
    });

    // Create role-specific profile based on user type
    if (role === 'TEACHER') {
      await prisma.teacherProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          profileCompleteness: 10, // Minimal profile created
        },
      });
    } else if (role === 'SCHOOL') {
      await prisma.schoolProfile.create({
        data: {
          userId: user.id,
          schoolName: '', // Will be filled in onboarding
          country: '',
          city: '',
        },
      });
    } else if (role === 'RECRUITER') {
      await prisma.recruiterProfile.create({
        data: {
          userId: user.id,
          companyName: '', // Will be filled in onboarding
        },
      });
    }

    // TODO: Send verification email if email verification is enabled
    // await sendVerificationEmail(email, user.id);

    // TODO: Subscribe to marketing emails if opted in
    // if (marketing) {
    //   await subscribeToMarketing(email, firstName);
    // }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
