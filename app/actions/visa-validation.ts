/**
 * Server Actions for Agent 3: Rule-based Visa Guard
 *
 * Handles visa eligibility checks and application validation
 */

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import {
  checkVisaEligibility,
  checkAllCountries,
  getEligibleCountries,
  getIneligibleCountries,
  generateVisaSummary,
  getEligibilityRecommendations,
  type VisaCheckResult
} from '@/lib/visa/checker';

/**
 * Calculate and cache visa status for all countries
 * Called when teacher completes/updates profile
 */
export async function calculateAllVisaStatuses(teacherId: string) {
  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    if (!teacher) {
      throw new Error('Teacher profile not found');
    }

    // Check eligibility for all countries
    const visaStatuses = checkAllCountries(teacher);

    // Update profile with cached results
    await prisma.teacherProfile.update({
      where: { id: teacherId },
      data: {
        visaStatus: visaStatuses as Prisma.InputJsonValue, // Stored as JSONB
        visaLastCheckedAt: new Date()
      }
    });

    // Calculate statistics
    const eligible = Object.values(visaStatuses).filter(v => v.eligible).length;
    const total = Object.keys(visaStatuses).length;

    revalidatePath(`/profile/${teacherId}`);

    return {
      success: true,
      eligible,
      total,
      percentage: Math.round((eligible / total) * 100)
    };

  } catch (error: any) {
    console.error('Visa status calculation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate if a teacher can apply to a specific job
 * Called when teacher clicks "Apply Now"
 */
export async function validateJobApplication(
  teacherId: string,
  jobId: string
): Promise<{
  canApply: boolean;
  reason?: string;
  checks: {
    visaEligible: boolean;
    experienceMatch: boolean;
    subjectMatch: boolean;
    salaryMatch: boolean;
  };
  visaDetails?: VisaCheckResult;
}> {
  try {
    const [teacher, job] = await Promise.all([
      prisma.teacherProfile.findUnique({
        where: { id: teacherId }
      }),
      prisma.jobPosting.findUnique({
        where: { id: jobId }
      })
    ]);

    if (!teacher || !job) {
      return {
        canApply: false,
        reason: 'Invalid application',
        checks: {
          visaEligible: false,
          experienceMatch: false,
          subjectMatch: false,
          salaryMatch: false
        }
      };
    }

    const checks = {
      visaEligible: false,
      experienceMatch: false,
      subjectMatch: false,
      salaryMatch: false
    };

    // Check 1: Visa Eligibility (BLOCKING)
    const visaCheck = checkVisaEligibility(teacher, job.country);
    checks.visaEligible = visaCheck.eligible;

    if (!visaCheck.eligible) {
      const primaryReason = visaCheck.disqualifications[0] ||
                           visaCheck.failedRequirements[0]?.message ||
                           'Visa requirements not met';

      return {
        canApply: false,
        reason: `Visa Requirements Not Met: ${primaryReason}`,
        checks,
        visaDetails: visaCheck
      };
    }

    // Check 2: Experience (BLOCKING)
    if (job.minYearsExperience && teacher.yearsExperience < job.minYearsExperience) {
      checks.experienceMatch = false;
      return {
        canApply: false,
        reason: `This position requires ${job.minYearsExperience}+ years of experience. You have ${teacher.yearsExperience} years.`,
        checks
      };
    }
    checks.experienceMatch = true;

    // Check 3: Subject (WARNING, not blocking)
    const hasSubjectMatch = teacher.subjects.some(s =>
      s.toLowerCase().includes(job.subject.toLowerCase()) ||
      job.subject.toLowerCase().includes(s.toLowerCase())
    );
    checks.subjectMatch = hasSubjectMatch;

    // Check 4: Salary (WARNING, not blocking)
    if (teacher.minSalaryUSD && job.salaryUSD < teacher.minSalaryUSD) {
      checks.salaryMatch = false;
      // This is a soft warning, not blocking
    } else {
      checks.salaryMatch = true;
    }

    return {
      canApply: true,
      checks,
      visaDetails: visaCheck
    };

  } catch (error: any) {
    console.error('Application validation failed:', error);
    return {
      canApply: false,
      reason: 'Validation failed. Please try again.',
      checks: {
        visaEligible: false,
        experienceMatch: false,
        subjectMatch: false,
        salaryMatch: false
      }
    };
  }
}

/**
 * Get visa status for a specific country
 */
export async function getVisaStatus(teacherId: string, country: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId }
  });

  if (!teacher) {
    return null;
  }

  // Check if cached status exists
  if (teacher.visaStatus && typeof teacher.visaStatus === 'object') {
    const visaStatusObj = teacher.visaStatus as Record<string, VisaCheckResult>;
    const cached = visaStatusObj[country];
    if (cached) {
      return {
        ...cached,
        cached: true,
        cachedAt: teacher.visaLastCheckedAt
      };
    }
  }

  // Calculate on-the-fly
  const result = checkVisaEligibility(teacher, country);

  return {
    ...result,
    cached: false
  };
}

/**
 * Get dashboard data showing visa eligibility across countries
 */
export async function getVisaDashboard(teacherId: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId }
  });

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  const eligible = getEligibleCountries(teacher);
  const ineligible = getIneligibleCountries(teacher);

  return {
    eligible,
    ineligible,
    totalCountries: eligible.length + ineligible.length,
    eligibilityPercentage: Math.round((eligible.length / (eligible.length + ineligible.length)) * 100)
  };
}

/**
 * Batch re-calculation (admin only)
 * Used when visa rules are updated
 */
export async function batchRecalculateVisaStatuses(
  country?: string
): Promise<{ total: number; successful: number; failed: number }> {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin only');
  }

  let whereClause = {};

  if (country) {
    // Only re-calculate for teachers who have this country in cached statuses
    whereClause = {
      visaStatus: {
        path: [country],
        not: null
      }
    };
  }

  const teachers = await prisma.teacherProfile.findMany({
    where: whereClause,
    select: { id: true }
  });

  console.log(`Re-calculating visa statuses for ${teachers.length} teachers...`);

  let successful = 0;
  let failed = 0;

  // Process in batches to avoid overwhelming the DB
  const BATCH_SIZE = 50;

  for (let i = 0; i < teachers.length; i += BATCH_SIZE) {
    const batch = teachers.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(t => calculateAllVisaStatuses(t.id))
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        successful++;
      } else {
        failed++;
      }
    }

    console.log(`Processed ${i + batch.length}/${teachers.length}...`);
  }

  return {
    total: teachers.length,
    successful,
    failed
  };
}

/**
 * Get countries where teacher needs to improve eligibility
 */
export async function getImprovementSuggestions(teacherId: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId }
  });

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  const ineligible = getIneligibleCountries(teacher);

  return ineligible.map(({ country, reasons }) => {
    const visaCheck = checkVisaEligibility(teacher, country);
    const recommendations = getEligibilityRecommendations(visaCheck);

    return {
      country,
      reasons,
      recommendations,
      priority: visaCheck.failedRequirements[0]?.priority || 'MEDIUM'
    };
  });
}
