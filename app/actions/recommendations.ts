'use server';

import { auth } from '@/lib/auth';
import {
  findRecommendedJobs,
  findSimilarJobs,
  type JobRecommendation,
} from '@/lib/db/job-recommendations';
import { prisma } from '@/lib/db';

/**
 * Get personalized job recommendations for the current teacher
 */
export async function getRecommendedJobs(
  minSimilarity: number = 0.8,
  limit: number = 10
): Promise<{ success: true; jobs: JobRecommendation[] } | { success: false; error: string }> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
      return { success: false, error: 'Unauthorized. Teacher login required.' };
    }

    // Get teacher profile
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return { success: false, error: 'Teacher profile not found.' };
    }

    const jobs = await findRecommendedJobs(profile.id, minSimilarity, limit);

    return { success: true, jobs };
  } catch (error) {
    console.error('Error getting recommended jobs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recommendations',
    };
  }
}

/**
 * Get jobs similar to a specific job
 */
export async function getSimilarJobs(
  jobId: string,
  limit: number = 5
): Promise<{ success: true; jobs: JobRecommendation[] } | { success: false; error: string }> {
  try {
    const jobs = await findSimilarJobs(jobId, limit);

    return { success: true, jobs };
  } catch (error) {
    console.error('Error getting similar jobs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get similar jobs',
    };
  }
}

/**
 * Update teacher preferences to improve recommendations
 */
export async function updateRecommendationPreferences(data: {
  preferredCountries?: string[];
  minSalaryUSD?: number;
  subjects?: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
      return { success: false, error: 'Unauthorized' };
    }

    // Get teacher profile
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return { success: false, error: 'Teacher profile not found' };
    }

    // Update preferences
    await prisma.teacherProfile.update({
      where: { id: profile.id },
      data: {
        ...(data.preferredCountries && { preferredCountries: data.preferredCountries }),
        ...(data.minSalaryUSD !== undefined && { minSalaryUSD: data.minSalaryUSD }),
        ...(data.subjects && { subjects: data.subjects }),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating preferences:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update preferences',
    };
  }
}
