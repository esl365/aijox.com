/**
 * Server Actions for Job Applications
 *
 * Handles application submission and management
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateJobApplication } from './visa-validation';

export type ApplicationSubmission = {
  jobId: string;
  coverLetter?: string;
};

/**
 * Submit a job application
 */
export async function submitApplication(data: ApplicationSubmission) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return {
        success: false,
        error: 'Unauthorized',
        message: 'Please login as a teacher to apply'
      };
    }

    const teacherProfileId = session.user.teacherProfileId;

    if (!teacherProfileId) {
      return {
        success: false,
        error: 'Profile not found',
        message: 'Please complete your profile before applying'
      };
    }

    // Validate application (includes visa check)
    const validation = await validateJobApplication(teacherProfileId, data.jobId);

    if (!validation.canApply) {
      return {
        success: false,
        error: 'Ineligible',
        message: validation.reason || 'You are not eligible for this position'
      };
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_teacherId: {
          jobId: data.jobId,
          teacherId: teacherProfileId
        }
      }
    });

    if (existingApplication) {
      return {
        success: false,
        error: 'Already applied',
        message: 'You have already applied to this position'
      };
    }

    // Calculate AI match score if embeddings exist
    let aiMatchScore: number | undefined;

    // TODO: Enable when embedding fields are added to Prisma schema
    // const [teacher, job] = await Promise.all([
    //   prisma.teacherProfile.findUnique({
    //     where: { id: teacherProfileId },
    //     select: { embedding: true }
    //   }),
    //   prisma.jobPosting.findUnique({
    //     where: { id: data.jobId },
    //     select: { embedding: true }
    //   })
    // ]);

    // TODO: Calculate cosine similarity if both embeddings exist
    // For now, use a placeholder
    // if (teacher?.embedding && job?.embedding) {
    //   aiMatchScore = 75; // Placeholder
    // }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId: data.jobId,
        teacherId: teacherProfileId,
        coverLetter: data.coverLetter,
        aiMatchScore,
        status: 'NEW'
      }
    });

    revalidatePath('/dashboard');
    revalidatePath('/applications');
    revalidatePath(`/jobs/${data.jobId}`);

    return {
      success: true,
      message: 'Application submitted successfully',
      applicationId: application.id
    };

  } catch (error: any) {
    console.error('Application submission failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to submit application. Please try again.'
    };
  }
}

/**
 * Get all applications for current teacher
 */
export async function getMyApplications() {
  const session = await auth();

  if (!session?.user?.teacherProfileId) {
    return [];
  }

  const applications = await prisma.application.findMany({
    where: {
      teacherId: session.user.teacherProfileId
    },
    include: {
      job: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return applications;
}

/**
 * Get single application by ID
 */
export async function getApplicationById(applicationId: string) {
  const session = await auth();

  if (!session?.user?.teacherProfileId) {
    return null;
  }

  const application = await prisma.application.findUnique({
    where: {
      id: applicationId,
      teacherId: session.user.teacherProfileId
    },
    include: {
      job: true,
      teacher: {
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    }
  });

  return application;
}

/**
 * Update application status (for schools)
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: 'NEW' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED'
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!schoolProfile) {
      return {
        success: false,
        error: 'School profile not found'
      };
    }

    // Verify the application belongs to this school's job
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          schoolId: schoolProfile.id,
        },
      },
      include: {
        job: {
          select: {
            title: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return {
        success: false,
        error: 'Application not found'
      };
    }

    // Update timestamps based on status
    const updateData: any = { status };
    const now = new Date();

    if (status === 'SCREENING') {
      updateData.screenedAt = now;
    } else if (status === 'INTERVIEW') {
      updateData.interviewedAt = now;
    } else if (status === 'OFFER') {
      updateData.offeredAt = now;
    } else if (status === 'HIRED') {
      updateData.hiredAt = now;
    } else if (status === 'REJECTED') {
      updateData.rejectedAt = now;
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
    });

    revalidatePath('/school/dashboard');
    revalidatePath('/school/applications');
    revalidatePath(`/school/applications/${applicationId}`);

    return {
      success: true,
      message: `Application status updated to ${status}`
    };

  } catch (error: any) {
    console.error('Failed to update application status:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Withdraw an application
 */
export async function withdrawApplication(applicationId: string) {
  try {
    const session = await auth();

    if (!session?.user?.teacherProfileId) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Verify ownership
    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
        teacherId: session.user.teacherProfileId
      }
    });

    if (!application) {
      return {
        success: false,
        error: 'Application not found'
      };
    }

    // Can only withdraw if status is NEW or SCREENING
    if (!['NEW', 'SCREENING'].includes(application.status)) {
      return {
        success: false,
        error: 'Cannot withdraw application at this stage'
      };
    }

    await prisma.application.delete({
      where: { id: applicationId }
    });

    revalidatePath('/dashboard');
    revalidatePath('/applications');

    return {
      success: true,
      message: 'Application withdrawn successfully'
    };

  } catch (error: any) {
    console.error('Failed to withdraw application:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
