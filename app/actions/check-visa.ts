/**
 * Server Actions for Agent 3: Rule-based Visa Guard
 *
 * Handles visa eligibility checking and caching
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import {
  checkVisaEligibility,
  checkAllCountries,
  getEligibleCountries,
  getIneligibleCountries,
  generateVisaSummary,
  getEligibilityRecommendations,
  type VisaCheckResult
} from '@/lib/visa/checker';
import { getAllSupportedCountries } from '@/lib/visa/rules';

export type VisaCheckResponse = {
  success: boolean;
  message: string;
  result?: VisaCheckResult;
  allResults?: Record<string, VisaCheckResult>;
  error?: string;
};

/**
 * Calculate and cache visa eligibility for all countries
 * Triggered on profile creation/update
 */
export async function calculateAllVisaStatuses(
  teacherId: string
): Promise<VisaCheckResponse> {
  try {
    // 1. Fetch teacher profile
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      include: { user: { select: { email: true } } }
    });

    if (!teacher) {
      return {
        success: false,
        error: 'Profile not found',
        message: 'Teacher profile does not exist'
      };
    }

    // 2. Check eligibility for all countries
    const allResults = checkAllCountries(teacher);

    // 3. Cache results in database (JSONB field)
    await prisma.teacherProfile.update({
      where: { id: teacherId },
      data: {
        visaStatus: allResults as Prisma.JsonValue, // Store complete results
        visaLastCheckedAt: new Date()
      }
    });

    // 4. Get summary stats
    const eligible = Object.values(allResults).filter(r => r.eligible).length;
    const total = Object.keys(allResults).length;

    revalidatePath(`/profile/${teacherId}`);

    return {
      success: true,
      message: `Eligible for ${eligible} out of ${total} countries`,
      allResults
    };

  } catch (error: any) {
    console.error('Visa calculation failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to calculate visa eligibility'
    };
  }
}

/**
 * Check visa eligibility for a specific country
 * (Real-time check, not cached)
 */
export async function checkVisaForCountry(
  teacherId: string,
  country: string
): Promise<VisaCheckResponse> {
  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      return {
        success: false,
        error: 'Profile not found',
        message: 'Teacher profile does not exist'
      };
    }

    const result = checkVisaEligibility(teacher, country);
    const summary = generateVisaSummary(result);
    const recommendations = getEligibilityRecommendations(result);

    return {
      success: true,
      message: summary,
      result: {
        ...result,
        recommendations
      }
    };

  } catch (error: any) {
    console.error('Visa check failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to check visa eligibility'
    };
  }
}

/**
 * Get cached visa status for a teacher
 */
export async function getCachedVisaStatus(teacherId: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    select: {
      visaStatus: true,
      visaLastCheckedAt: true
    }
  });

  if (!teacher || !teacher.visaStatus) {
    return null;
  }

  // Check if cache is stale (older than 30 days)
  const isStale = teacher.visaLastCheckedAt
    ? (Date.now() - teacher.visaLastCheckedAt.getTime()) > (30 * 24 * 60 * 60 * 1000)
    : true;

  return {
    visaStatus: teacher.visaStatus,
    lastChecked: teacher.visaLastCheckedAt,
    isStale
  };
}

/**
 * Get list of eligible countries for a teacher
 */
export async function getTeacherEligibleCountries(teacherId: string): Promise<string[]> {
  const cached = await getCachedVisaStatus(teacherId);

  if (cached && !cached.isStale) {
    // Return from cache
    const results = cached.visaStatus as Record<string, VisaCheckResult>;
    return Object.entries(results)
      .filter(([_, result]) => result.eligible)
      .map(([country, _]) => country);
  }

  // Recalculate if cache is stale
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId }
  });

  if (!teacher) return [];

  return getEligibleCountries(teacher);
}

/**
 * Validate visa before job application
 * (Prevents ineligible applications)
 */
export async function validateVisaBeforeApplication(
  teacherId: string,
  jobId: string
): Promise<{
  canApply: boolean;
  reason?: string;
  result?: VisaCheckResult;
}> {
  const session = await auth();

  if (!session?.user?.id) {
    return { canApply: false, reason: 'Unauthorized' };
  }

  // Get job country
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: { country: true }
  });

  if (!job) {
    return { canApply: false, reason: 'Job not found' };
  }

  // Get teacher profile
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId }
  });

  if (!teacher) {
    return { canApply: false, reason: 'Profile not found' };
  }

  // Check visa eligibility
  const result = checkVisaEligibility(teacher, job.country);

  if (!result.eligible) {
    const criticalReasons = result.failedRequirements
      .filter(f => f.priority === 'CRITICAL')
      .map(f => f.message);

    return {
      canApply: false,
      reason: criticalReasons[0] || result.failedRequirements[0]?.message || 'Not eligible for visa',
      result
    };
  }

  return {
    canApply: true,
    result
  };
}

/**
 * Batch recalculation for all teachers (admin tool)
 */
export async function batchRecalculateVisaStatuses(): Promise<{
  total: number;
  successful: number;
  failed: number;
}> {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin only');
  }

  const teachers = await prisma.teacherProfile.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true }
  });

  let successful = 0;
  let failed = 0;

  for (const teacher of teachers) {
    const result = await calculateAllVisaStatuses(teacher.id);
    if (result.success) {
      successful++;
    } else {
      failed++;
    }

    // Rate limiting to avoid overwhelming database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return {
    total: teachers.length,
    successful,
    failed
  };
}

/**
 * Get visa statistics for analytics
 */
export async function getVisaStatistics(): Promise<{
  totalTeachers: number;
  byCountry: Record<string, { eligible: number; total: number; percentage: number }>;
}> {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'RECRUITER') {
    throw new Error('Unauthorized');
  }

  const teachers = await prisma.teacherProfile.findMany({
    where: {
      status: 'ACTIVE',
      visaStatus: { not: null }
    },
    select: { visaStatus: true }
  });

  const countries = getAllSupportedCountries();
  const stats: Record<string, { eligible: number; total: number; percentage: number }> = {};

  for (const country of countries) {
    const eligible = teachers.filter(t => {
      const visaStatus = t.visaStatus as Record<string, VisaCheckResult>;
      return visaStatus?.[country]?.eligible === true;
    }).length;

    const total = teachers.length;
    const percentage = total > 0 ? Math.round((eligible / total) * 100) : 0;

    stats[country] = { eligible, total, percentage };
  }

  return {
    totalTeachers: teachers.length,
    byCountry: stats
  };
}

/**
 * Get supported countries list (for UI dropdowns)
 */
export async function getSupportedCountries(): Promise<string[]> {
  return getAllSupportedCountries();
}
