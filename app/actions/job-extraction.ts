/**
 * Server Actions for AI Job Extraction
 */

'use server';

import { extractJobFields, batchExtractJobs, type ExtractionResult } from '@/lib/ai/job-parser';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Extract job fields from raw text (Server Action)
 */
export async function extractJobFromText(rawText: string): Promise<ExtractionResult> {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Only recruiters and schools can extract jobs
  if (session.user.role !== 'RECRUITER' && session.user.role !== 'SCHOOL') {
    throw new Error('Only recruiters and schools can create job postings');
  }

  try {
    const result = await extractJobFields(rawText, true); // Use cache
    return result;
  } catch (error) {
    console.error('Error extracting job fields:', error);
    throw new Error('Failed to extract job fields from text');
  }
}

/**
 * Batch extract multiple jobs (Server Action)
 */
export async function extractMultipleJobs(rawTexts: string[]): Promise<ExtractionResult[]> {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (session.user.role !== 'RECRUITER' && session.user.role !== 'SCHOOL') {
    throw new Error('Only recruiters and schools can create job postings');
  }

  try {
    const results = await batchExtractJobs(rawTexts);
    return results;
  } catch (error) {
    console.error('Error batch extracting jobs:', error);
    throw new Error('Failed to extract job fields from texts');
  }
}

/**
 * Get jobs that require admin review (low confidence)
 */
export async function getJobsRequiringReview() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const jobs = await prisma.jobPosting.findMany({
    where: {
      requiresReview: true,
      status: 'ACTIVE',
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      school: {
        select: {
          schoolName: true,
          country: true,
          city: true,
        },
      },
      recruiter: {
        select: {
          companyName: true,
        },
      },
    },
    take: 50,
  });

  return jobs;
}

/**
 * Approve a job posting (remove review flag)
 */
export async function approveJobPosting(jobId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await prisma.jobPosting.update({
    where: { id: jobId },
    data: {
      requiresReview: false,
    },
  });

  return { success: true };
}

/**
 * Get extraction cache statistics (Admin only)
 */
export async function getExtractionCacheStats() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const [totalCached, totalHits, avgConfidence] = await Promise.all([
    prisma.aIExtractionCache.count(),
    prisma.aIExtractionCache.aggregate({
      _sum: {
        hitCount: true,
      },
    }),
    prisma.aIExtractionCache.aggregate({
      _avg: {
        confidenceScore: true,
      },
    }),
  ]);

  const recentExtractions = await prisma.aIExtractionCache.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
    select: {
      id: true,
      createdAt: true,
      confidenceScore: true,
      hitCount: true,
      extractionModel: true,
    },
  });

  return {
    totalCached,
    totalHits: totalHits._sum.hitCount || 0,
    avgConfidence: avgConfidence._avg.confidenceScore || 0,
    recentExtractions,
  };
}
