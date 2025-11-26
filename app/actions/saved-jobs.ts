/**
 * Server Actions for Saved Jobs
 *
 * Handles job bookmarking/saving functionality for teachers
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Save a job for later
 */
export async function saveJob(jobId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return {
        success: false,
        error: 'Unauthorized',
        message: 'Please login as a teacher to save jobs'
      };
    }

    const teacherProfileId = session.user.teacherProfileId;

    if (!teacherProfileId) {
      return {
        success: false,
        error: 'Profile not found',
        message: 'Please complete your profile before saving jobs'
      };
    }

    // Check if job exists and is active
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: { id: true, status: true }
    });

    if (!job || job.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Job not found',
        message: 'This job is no longer available'
      };
    }

    // Check if already saved
    const existingSave = await prisma.savedJob.findUnique({
      where: {
        teacherId_jobId: {
          teacherId: teacherProfileId,
          jobId
        }
      }
    });

    if (existingSave) {
      return {
        success: false,
        error: 'Already saved',
        message: 'You have already saved this job'
      };
    }

    // Save the job
    await prisma.savedJob.create({
      data: {
        teacherId: teacherProfileId,
        jobId
      }
    });

    revalidatePath('/jobs');
    revalidatePath('/dashboard');
    revalidatePath('/saved-jobs');

    return {
      success: true,
      message: 'Job saved successfully'
    };

  } catch (error: any) {
    console.error('Failed to save job:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to save job. Please try again.'
    };
  }
}

/**
 * Unsave a job
 */
export async function unsaveJob(jobId: string) {
  try {
    const session = await auth();

    if (!session?.user?.teacherProfileId) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const teacherProfileId = session.user.teacherProfileId;

    // Delete the saved job
    await prisma.savedJob.delete({
      where: {
        teacherId_jobId: {
          teacherId: teacherProfileId,
          jobId
        }
      }
    });

    revalidatePath('/jobs');
    revalidatePath('/dashboard');
    revalidatePath('/saved-jobs');

    return {
      success: true,
      message: 'Job removed from saved list'
    };

  } catch (error: any) {
    console.error('Failed to unsave job:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to remove job. Please try again.'
    };
  }
}

/**
 * Toggle save/unsave (for optimistic UI)
 */
export async function toggleSaveJob(jobId: string, currentlySaved: boolean) {
  if (currentlySaved) {
    return unsaveJob(jobId);
  } else {
    return saveJob(jobId);
  }
}

/**
 * Get all saved jobs for current teacher
 */
export async function getSavedJobs() {
  try {
    const session = await auth();

    if (!session?.user?.teacherProfileId) {
      return [];
    }

    const savedJobs = await prisma.savedJob.findMany({
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

    return savedJobs.map(save => save.job);

  } catch (error) {
    console.error('Failed to fetch saved jobs:', error);
    return [];
  }
}

/**
 * Get saved job IDs (for checking if job is saved)
 */
export async function getSavedJobIds() {
  try {
    const session = await auth();

    if (!session?.user?.teacherProfileId) {
      return [];
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: {
        teacherId: session.user.teacherProfileId
      },
      select: {
        jobId: true
      }
    });

    return savedJobs.map(save => save.jobId);

  } catch (error) {
    console.error('Failed to fetch saved job IDs:', error);
    return [];
  }
}

/**
 * Check if a job is saved
 */
export async function isJobSaved(jobId: string): Promise<boolean> {
  try {
    const session = await auth();

    if (!session?.user?.teacherProfileId) {
      return false;
    }

    const savedJob = await prisma.savedJob.findUnique({
      where: {
        teacherId_jobId: {
          teacherId: session.user.teacherProfileId,
          jobId
        }
      }
    });

    return !!savedJob;

  } catch (error) {
    console.error('Failed to check if job is saved:', error);
    return false;
  }
}

/**
 * Get count of saved jobs
 */
export async function getSavedJobsCount(): Promise<number> {
  try {
    const session = await auth();

    if (!session?.user?.teacherProfileId) {
      return 0;
    }

    const count = await prisma.savedJob.count({
      where: {
        teacherId: session.user.teacherProfileId
      }
    });

    return count;

  } catch (error) {
    console.error('Failed to get saved jobs count:', error);
    return 0;
  }
}
