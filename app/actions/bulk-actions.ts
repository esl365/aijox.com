/**
 * Server Actions for Bulk Operations (P1.8)
 *
 * Bulk update, assign, and manage applications
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ApplicationStatus } from '@prisma/client';

/**
 * Bulk update application status
 */
export async function bulkUpdateStatus(
  applicationIds: string[],
  status: ApplicationStatus
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
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return {
        success: false,
        error: 'School profile not found'
      };
    }

    // Verify all applications belong to this school
    const applications = await prisma.application.findMany({
      where: {
        id: { in: applicationIds },
        job: {
          schoolId: schoolProfile.id
        }
      }
    });

    if (applications.length !== applicationIds.length) {
      return {
        success: false,
        error: 'Some applications not found or unauthorized'
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

    await prisma.application.updateMany({
      where: {
        id: { in: applicationIds }
      },
      data: updateData
    });

    revalidatePath('/school/dashboard');
    revalidatePath('/school/applications');

    return {
      success: true,
      message: `Successfully updated ${applications.length} applications to ${status}`,
      count: applications.length
    };

  } catch (error: any) {
    console.error('Failed to bulk update status:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Bulk assign candidates to a team member
 */
export async function bulkAssignCandidates(
  applicationIds: string[],
  assignedToId: string
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
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return {
        success: false,
        error: 'School profile not found'
      };
    }

    // Verify all applications belong to this school
    const applications = await prisma.application.findMany({
      where: {
        id: { in: applicationIds },
        job: {
          schoolId: schoolProfile.id
        }
      }
    });

    if (applications.length !== applicationIds.length) {
      return {
        success: false,
        error: 'Some applications not found or unauthorized'
      };
    }

    // Create or update ratings with assignment
    for (const app of applications) {
      await prisma.candidateRating.upsert({
        where: {
          applicationId: app.id
        },
        create: {
          applicationId: app.id,
          rating: 3, // Default rating
          tags: [],
          assignedToId
        },
        update: {
          assignedToId
        }
      });
    }

    revalidatePath('/school/dashboard');
    revalidatePath('/school/applications');

    return {
      success: true,
      message: `Successfully assigned ${applications.length} candidates`,
      count: applications.length
    };

  } catch (error: any) {
    console.error('Failed to bulk assign candidates:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Bulk add tags to candidates
 */
export async function bulkAddTags(
  applicationIds: string[],
  tags: string[]
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
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return {
        success: false,
        error: 'School profile not found'
      };
    }

    // Verify all applications belong to this school
    const applications = await prisma.application.findMany({
      where: {
        id: { in: applicationIds },
        job: {
          schoolId: schoolProfile.id
        }
      }
    });

    if (applications.length !== applicationIds.length) {
      return {
        success: false,
        error: 'Some applications not found or unauthorized'
      };
    }

    // Add tags to each application's rating
    for (const app of applications) {
      const existingRating = await prisma.candidateRating.findUnique({
        where: { applicationId: app.id }
      });

      if (existingRating) {
        // Merge tags without duplicates
        const mergedTags = Array.from(new Set([...existingRating.tags, ...tags]));
        await prisma.candidateRating.update({
          where: { applicationId: app.id },
          data: { tags: mergedTags }
        });
      } else {
        // Create new rating with tags
        await prisma.candidateRating.create({
          data: {
            applicationId: app.id,
            rating: 3, // Default rating
            tags
          }
        });
      }
    }

    revalidatePath('/school/dashboard');
    revalidatePath('/school/applications');

    return {
      success: true,
      message: `Successfully added tags to ${applications.length} candidates`,
      count: applications.length
    };

  } catch (error: any) {
    console.error('Failed to bulk add tags:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Bulk remove tags from candidates
 */
export async function bulkRemoveTags(
  applicationIds: string[],
  tags: string[]
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
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return {
        success: false,
        error: 'School profile not found'
      };
    }

    // Verify all applications belong to this school
    const applications = await prisma.application.findMany({
      where: {
        id: { in: applicationIds },
        job: {
          schoolId: schoolProfile.id
        }
      },
      include: {
        rating: true
      }
    });

    if (applications.length !== applicationIds.length) {
      return {
        success: false,
        error: 'Some applications not found or unauthorized'
      };
    }

    // Remove tags from each application's rating
    for (const app of applications) {
      if (app.rating) {
        const filteredTags = app.rating.tags.filter(tag => !tags.includes(tag));
        await prisma.candidateRating.update({
          where: { applicationId: app.id },
          data: { tags: filteredTags }
        });
      }
    }

    revalidatePath('/school/dashboard');
    revalidatePath('/school/applications');

    return {
      success: true,
      message: `Successfully removed tags from ${applications.length} candidates`,
      count: applications.length
    };

  } catch (error: any) {
    console.error('Failed to bulk remove tags:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Bulk delete applications (only NEW or SCREENING status)
 */
export async function bulkDeleteApplications(applicationIds: string[]) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return {
        success: false,
        error: 'School profile not found'
      };
    }

    // Verify all applications belong to this school and can be deleted
    const applications = await prisma.application.findMany({
      where: {
        id: { in: applicationIds },
        job: {
          schoolId: schoolProfile.id
        },
        status: { in: ['NEW', 'SCREENING'] }
      }
    });

    if (applications.length === 0) {
      return {
        success: false,
        error: 'No eligible applications found for deletion'
      };
    }

    await prisma.application.deleteMany({
      where: {
        id: { in: applications.map(a => a.id) }
      }
    });

    revalidatePath('/school/dashboard');
    revalidatePath('/school/applications');

    return {
      success: true,
      message: `Successfully deleted ${applications.length} applications`,
      count: applications.length
    };

  } catch (error: any) {
    console.error('Failed to bulk delete applications:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get bulk action summary
 */
export async function getBulkActionSummary(applicationIds: string[]) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return {
        success: false,
        error: 'Unauthorized',
        summary: null
      };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return {
        success: false,
        error: 'School profile not found',
        summary: null
      };
    }

    const applications = await prisma.application.findMany({
      where: {
        id: { in: applicationIds },
        job: {
          schoolId: schoolProfile.id
        }
      },
      include: {
        job: {
          select: {
            title: true
          }
        },
        rating: true
      }
    });

    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const jobCounts = applications.reduce((acc, app) => {
      acc[app.job.title] = (acc[app.job.title] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const allTags = applications
      .filter(app => app.rating)
      .flatMap(app => app.rating!.tags);
    const uniqueTags = Array.from(new Set(allTags));

    return {
      success: true,
      summary: {
        total: applications.length,
        statusCounts,
        jobCounts,
        uniqueTags,
        canDelete: applications.every(app => ['NEW', 'SCREENING'].includes(app.status))
      }
    };

  } catch (error: any) {
    console.error('Failed to get bulk action summary:', error);
    return {
      success: false,
      error: error.message,
      summary: null
    };
  }
}
