import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Resume Parsing API - Task 1.4
 * POST /api/parse-resume
 *
 * Parses uploaded resume (PDF/DOCX) and extracts structured data
 * TODO: Integrate with actual parsing service (Affinda, Eden AI, or open-source)
 */

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and DOCX are supported.' },
        { status: 400 }
      );
    }

    // TODO: Implement actual resume parsing
    // For now, return mock parsed data
    const parsedData = {
      personalInfo: {
        name: 'Sample User',
        email: 'sample@example.com',
        phone: '+1234567890',
      },
      education: [
        {
          degree: 'Bachelor of Education',
          institution: 'Sample University',
          year: '2020',
        },
      ],
      experience: [
        {
          title: 'ESL Teacher',
          company: 'Sample School',
          duration: '2020-2023',
          description: 'Taught English to students...',
        },
      ],
      skills: ['English', 'TEFL', 'Classroom Management'],
      certifications: ['TEFL Certificate', "Bachelor's Degree"],
    };

    return NextResponse.json({
      success: true,
      data: parsedData,
      message: 'Resume parsed successfully (mock data)',
    });

  } catch (error: any) {
    console.error('Resume parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume', message: error.message },
      { status: 500 }
    );
  }
}
