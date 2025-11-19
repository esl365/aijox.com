'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateEmailDomain } from '@/lib/validation/email-domain';
import { revalidatePath } from 'next/cache';

export type VerificationRequest = {
  id: string;
  type: 'SCHOOL' | 'RECRUITER';
  entityId: string;
  entityName: string;
  userEmail: string;
  domain: string;
  isEducational: boolean;
  confidence: string;
  createdAt: Date;
  website?: string;
  companyName?: string;
};

/**
 * Get all pending verification requests (Admin only)
 */
export async function getPendingVerifications(): Promise<VerificationRequest[]> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return [];
  }

  // Get unverified schools
  const schools = await prisma.schoolProfile.findMany({
    where: { isVerified: false },
    include: {
      user: {
        select: {
          email: true,
          emailVerified: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get unverified recruiters
  const recruiters = await prisma.recruiterProfile.findMany({
    where: { isVerified: false },
    include: {
      user: {
        select: {
          email: true,
          emailVerified: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const requests: VerificationRequest[] = [];

  // Process schools
  for (const school of schools) {
    const domainValidation = validateEmailDomain(school.user.email);
    requests.push({
      id: school.id,
      type: 'SCHOOL',
      entityId: school.id,
      entityName: school.schoolName,
      userEmail: school.user.email,
      domain: domainValidation.domain,
      isEducational: domainValidation.isEducational,
      confidence: domainValidation.confidence,
      createdAt: school.createdAt,
      website: school.website || undefined,
    });
  }

  // Process recruiters
  for (const recruiter of recruiters) {
    const domainValidation = validateEmailDomain(recruiter.user.email);
    requests.push({
      id: recruiter.id,
      type: 'RECRUITER',
      entityId: recruiter.id,
      entityName: recruiter.companyName || 'Independent Recruiter',
      userEmail: recruiter.user.email,
      domain: domainValidation.domain,
      isEducational: domainValidation.isEducational,
      confidence: domainValidation.confidence,
      createdAt: recruiter.createdAt,
      companyName: recruiter.companyName || undefined,
    });
  }

  // Sort by creation date (newest first)
  return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Verify a school (Admin only)
 */
export async function verifySchool(
  schoolId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await prisma.schoolProfile.update({
      where: { id: schoolId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: session.user.id,
        verificationNotes: notes,
      },
    });

    revalidatePath('/admin/verification');
    revalidatePath('/jobs');

    return { success: true };
  } catch (error) {
    console.error('Error verifying school:', error);
    return { success: false, error: 'Failed to verify school' };
  }
}

/**
 * Verify a recruiter (Admin only)
 */
export async function verifyRecruiter(
  recruiterId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await prisma.recruiterProfile.update({
      where: { id: recruiterId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: session.user.id,
        verificationNotes: notes,
      },
    });

    revalidatePath('/admin/verification');
    revalidatePath('/jobs');

    return { success: true };
  } catch (error) {
    console.error('Error verifying recruiter:', error);
    return { success: false, error: 'Failed to verify recruiter' };
  }
}

/**
 * Reject a verification request (Admin only)
 */
export async function rejectVerification(
  type: 'SCHOOL' | 'RECRUITER',
  entityId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    if (type === 'SCHOOL') {
      await prisma.schoolProfile.update({
        where: { id: entityId },
        data: {
          verificationNotes: `Rejected: ${reason}`,
        },
      });
    } else {
      await prisma.recruiterProfile.update({
        where: { id: entityId },
        data: {
          verificationNotes: `Rejected: ${reason}`,
        },
      });
    }

    revalidatePath('/admin/verification');

    return { success: true };
  } catch (error) {
    console.error('Error rejecting verification:', error);
    return { success: false, error: 'Failed to reject verification' };
  }
}

/**
 * Get verification stats (Admin only)
 */
export async function getVerificationStats() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null;
  }

  const [
    totalSchools,
    verifiedSchools,
    pendingSchools,
    totalRecruiters,
    verifiedRecruiters,
    pendingRecruiters,
  ] = await Promise.all([
    prisma.schoolProfile.count(),
    prisma.schoolProfile.count({ where: { isVerified: true } }),
    prisma.schoolProfile.count({ where: { isVerified: false } }),
    prisma.recruiterProfile.count(),
    prisma.recruiterProfile.count({ where: { isVerified: true } }),
    prisma.recruiterProfile.count({ where: { isVerified: false } }),
  ]);

  return {
    schools: {
      total: totalSchools,
      verified: verifiedSchools,
      pending: pendingSchools,
      verificationRate: totalSchools > 0 ? (verifiedSchools / totalSchools) * 100 : 0,
    },
    recruiters: {
      total: totalRecruiters,
      verified: verifiedRecruiters,
      pending: pendingRecruiters,
      verificationRate:
        totalRecruiters > 0 ? (verifiedRecruiters / totalRecruiters) * 100 : 0,
    },
  };
}

/**
 * Check if current user is verified
 */
export async function checkUserVerification(): Promise<{
  isVerified: boolean;
  verifiedAt?: Date;
}> {
  const session = await auth();

  if (!session?.user) {
    return { isVerified: false };
  }

  if (session.user.role === 'SCHOOL') {
    const school = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id },
      select: { isVerified: true, verifiedAt: true },
    });

    return {
      isVerified: school?.isVerified || false,
      verifiedAt: school?.verifiedAt || undefined,
    };
  }

  if (session.user.role === 'RECRUITER') {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId: session.user.id },
      select: { isVerified: true, verifiedAt: true },
    });

    return {
      isVerified: recruiter?.isVerified || false,
      verifiedAt: recruiter?.verifiedAt || undefined,
    };
  }

  return { isVerified: false };
}
