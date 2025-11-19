/**
 * Server Actions for Teacher Dashboard
 *
 * Handles dashboard data fetching and aggregation
 */

'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getVisaDashboard } from './check-visa';
import type { Application, JobPosting } from '@prisma/client';

export type DashboardData = {
  profile: {
    completeness: number;
    videoStatus: string;
    missingFields: string[];
  };
  applications: {
    total: number;
    byStatus: Record<string, number>;
    recent: (Application & { job: JobPosting })[];
  };
  visaStatus: {
    eligible: { country: string; reasons: string[] }[];
    ineligible: { country: string; reasons: string[] }[];
    totalCountries: number;
    eligibilityPercentage: number;
  };
  stats: {
    profileViews: number;
    matchesSent: number;
  };
};

/**
 * Get complete dashboard data for teacher
 */
export async function getTeacherDashboard(): Promise<DashboardData | null> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return null;
  }

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      applications: {
        include: {
          job: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      },
      matchNotifications: {
        where: { sentAt: { not: null } }
      }
    }
  });

  if (!teacherProfile) {
    return null;
  }

  // Calculate profile completeness
  const missingFields: string[] = [];
  if (!teacherProfile.videoUrl) missingFields.push('Video Resume');
  if (!teacherProfile.citizenship) missingFields.push('Citizenship');
  if (!teacherProfile.degreeLevel) missingFields.push('Degree Information');
  if (!teacherProfile.yearsExperience) missingFields.push('Years of Experience');
  if (teacherProfile.subjects.length === 0) missingFields.push('Teaching Subjects');
  if (!teacherProfile.bio) missingFields.push('Professional Bio');

  // Get visa status
  const visaStatus = await getVisaDashboard(teacherProfile.id);

  // Calculate application stats
  const applicationsByStatus = teacherProfile.applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    profile: {
      completeness: teacherProfile.profileCompleteness,
      videoStatus: teacherProfile.videoAnalysisStatus || 'PENDING',
      missingFields
    },
    applications: {
      total: teacherProfile.applications.length,
      byStatus: applicationsByStatus,
      recent: teacherProfile.applications
    },
    visaStatus,
    stats: {
      profileViews: 0, // TODO: Implement view tracking
      matchesSent: teacherProfile.matchNotifications.length
    }
  };
}

/**
 * Get application statistics
 */
export async function getApplicationStats(teacherId: string) {
  const stats = await prisma.application.groupBy({
    by: ['status'],
    where: { teacherId },
    _count: {
      id: true
    }
  });

  return stats.map(s => ({
    status: s.status,
    count: s._count.id
  }));
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(teacherId: string, limit: number = 10) {
  const [applications, matchNotifications] = await Promise.all([
    prisma.application.findMany({
      where: { teacherId },
      include: {
        job: {
          select: {
            title: true,
            schoolName: true,
            country: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    }),
    prisma.matchNotification.findMany({
      where: {
        teacherId,
        sentAt: { not: null }
      },
      include: {
        job: {
          select: {
            title: true,
            schoolName: true,
            country: true
          }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: limit
    })
  ]);

  // Combine and sort by date
  const activities = [
    ...applications.map(app => ({
      type: 'application' as const,
      date: app.createdAt,
      job: app.job,
      status: app.status,
      id: app.id
    })),
    ...matchNotifications.map(match => ({
      type: 'match' as const,
      date: match.sentAt!,
      job: match.job,
      matchScore: Number(match.matchScore),
      id: match.id
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime())
   .slice(0, limit);

  return activities;
}

/**
 * Get recommended jobs based on teacher profile using AI vector similarity
 */
export async function getRecommendedJobs(teacherId: string, limit: number = 6) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    select: {
      id: true,
      // @ts-ignore - embedding is Unsupported type
      embedding: true,
      subjects: true,
      preferredCountries: true,
      minSalaryUSD: true,
      yearsExperience: true,
    }
  });

  if (!teacher) return [];

  // If no embedding, fall back to basic filtering
  if (!teacher.embedding) {
    const jobs = await prisma.jobPosting.findMany({
      where: {
        status: 'ACTIVE',
        AND: [
          {
            OR: [
              { country: { in: teacher.preferredCountries } },
              { subject: { in: teacher.subjects } }
            ]
          },
          teacher.minSalaryUSD
            ? { salaryUSD: { gte: teacher.minSalaryUSD } }
            : {},
          { minYearsExperience: { lte: teacher.yearsExperience } }
        ]
      },
      orderBy: [
        { salaryUSD: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });
    return jobs;
  }

  // Get already applied job IDs to exclude
  const applications = await prisma.application.findMany({
    where: { teacherId },
    select: { jobId: true },
  });
  const appliedJobIds = applications.map((app) => app.jobId);

  // Use vector similarity search for AI-powered recommendations
  const matches = await prisma.$queryRaw<
    Array<{
      id: string;
      title: string;
      schoolName: string;
      country: string;
      city: string;
      subject: string;
      salaryUSD: number;
      housingProvided: boolean;
      flightProvided: boolean;
      description: string;
      requirements: string | null;
      contractLength: number | null;
      minYearsExperience: number;
      status: string;
      createdAt: Date;
    }>
  >`
    SELECT
      j.id,
      j.title,
      j."schoolName",
      j.country,
      j.city,
      j.subject,
      j."salaryUSD",
      j."housingProvided",
      j."flightProvided",
      j.description,
      j.requirements,
      j."contractLength",
      j."minYearsExperience",
      j.status,
      j."createdAt"
    FROM "JobPosting" j
    WHERE j.status = 'ACTIVE'
      AND j.embedding IS NOT NULL
      AND (j.embedding <=> ${teacher.embedding}::vector) < 0.2
      ${
        appliedJobIds.length > 0
          ? `AND j.id NOT IN (${appliedJobIds.map((id) => `'${id}'`).join(', ')})`
          : ''
      }
    ORDER BY (j.embedding <=> ${teacher.embedding}::vector) ASC
    LIMIT ${limit}
  `;

  return matches;
}
