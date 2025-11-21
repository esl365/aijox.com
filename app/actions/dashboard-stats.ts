'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  messagesUnread: number;
  avgResponseRate: number;
  hiringRate: number;
}

export interface RecentJob {
  id: string;
  title: string;
  location: string;
  status: string;
  applications: number;
  views: number;
  posted: string;
}

export interface RecentApplication {
  id: string;
  candidateName: string;
  jobTitle: string;
  appliedDate: string;
  status: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const schoolProfile = await prisma.schoolProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!schoolProfile) {
    throw new Error('School profile not found');
  }

  const [
    activeJobs,
    totalApplications,
    totalApplicationsForRate,
    respondedApplications,
    hiredApplications,
  ] = await Promise.all([
    // Active jobs count
    prisma.jobPosting.count({
      where: {
        schoolId: schoolProfile.id,
        status: 'ACTIVE',
      },
    }),
    // Total applications count
    prisma.application.count({
      where: {
        job: {
          schoolId: schoolProfile.id,
        },
      },
    }),
    // Applications for response rate
    prisma.application.count({
      where: {
        job: {
          schoolId: schoolProfile.id,
        },
      },
    }),
    // Responded applications
    prisma.application.count({
      where: {
        job: {
          schoolId: schoolProfile.id,
        },
        status: {
          in: ['SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'],
        },
      },
    }),
    // Hired applications
    prisma.application.count({
      where: {
        job: {
          schoolId: schoolProfile.id,
        },
        status: 'HIRED',
      },
    }),
  ]);

  const avgResponseRate =
    totalApplicationsForRate > 0
      ? Math.round((respondedApplications / totalApplicationsForRate) * 100)
      : 0;

  const hiringRate =
    totalApplicationsForRate > 0
      ? Math.round((hiredApplications / totalApplicationsForRate) * 100)
      : 0;

  return {
    activeJobs,
    totalApplications,
    totalViews: 0, // Views tracking not implemented yet
    messagesUnread: 0, // Messages not implemented yet
    avgResponseRate,
    hiringRate,
  };
}

export async function getRecentJobs(): Promise<RecentJob[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const schoolProfile = await prisma.schoolProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!schoolProfile) {
    throw new Error('School profile not found');
  }

  const jobs = await prisma.jobPosting.findMany({
    where: {
      schoolId: schoolProfile.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
    include: {
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    location: `${job.city}, ${job.country}`,
    status: job.status,
    applications: job._count.applications,
    views: 0, // Views tracking not implemented yet
    posted: formatRelativeTime(job.createdAt),
  }));
}

export async function getRecentApplications(): Promise<RecentApplication[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const schoolProfile = await prisma.schoolProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!schoolProfile) {
    throw new Error('School profile not found');
  }

  const applications = await prisma.application.findMany({
    where: {
      job: {
        schoolId: schoolProfile.id,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
    include: {
      teacher: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      job: {
        select: {
          title: true,
        },
      },
    },
  });

  return applications.map((app) => ({
    id: app.id,
    candidateName: app.teacher.user.name || 'Unknown',
    jobTitle: app.job.title,
    appliedDate: formatRelativeTime(app.createdAt),
    status: app.status,
  }));
}

export interface HiringFunnelData {
  totalApplications: number;
  newApplications: number;
  screening: number;
  interview: number;
  offer: number;
  hired: number;
  rejected: number;
}

export async function getHiringFunnelData(): Promise<HiringFunnelData> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const schoolProfile = await prisma.schoolProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!schoolProfile) {
    throw new Error('School profile not found');
  }

  const [total, newApps, screening, interview, offer, hired, rejected] = await Promise.all([
    prisma.application.count({
      where: { job: { schoolId: schoolProfile.id } },
    }),
    prisma.application.count({
      where: { job: { schoolId: schoolProfile.id }, status: 'NEW' },
    }),
    prisma.application.count({
      where: { job: { schoolId: schoolProfile.id }, status: 'SCREENING' },
    }),
    prisma.application.count({
      where: { job: { schoolId: schoolProfile.id }, status: 'INTERVIEW' },
    }),
    prisma.application.count({
      where: { job: { schoolId: schoolProfile.id }, status: 'OFFER' },
    }),
    prisma.application.count({
      where: { job: { schoolId: schoolProfile.id }, status: 'HIRED' },
    }),
    prisma.application.count({
      where: { job: { schoolId: schoolProfile.id }, status: 'REJECTED' },
    }),
  ]);

  return {
    totalApplications: total,
    newApplications: newApps,
    screening,
    interview,
    offer,
    hired,
    rejected,
  };
}

export interface PerformanceBenchmark {
  metric: string;
  schoolValue: number;
  platformAverage: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

export async function getPerformanceBenchmarks(): Promise<PerformanceBenchmark[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const schoolProfile = await prisma.schoolProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!schoolProfile) {
    throw new Error('School profile not found');
  }

  // Get school metrics
  const [schoolApps, schoolHired, schoolJobs] = await Promise.all([
    prisma.application.count({
      where: { job: { schoolId: schoolProfile.id } },
    }),
    prisma.application.count({
      where: {
        job: { schoolId: schoolProfile.id },
        status: 'HIRED',
      },
    }),
    prisma.jobPosting.count({
      where: { schoolId: schoolProfile.id },
    }),
  ]);

  // Get platform metrics (all schools)
  const [platformApps, platformHired, platformJobs, totalSchools] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { status: 'HIRED' } }),
    prisma.jobPosting.count(),
    prisma.schoolProfile.count(),
  ]);

  // Calculate metrics
  const schoolHiringRate = schoolApps > 0 ? (schoolHired / schoolApps) * 100 : 0;
  const platformHiringRate = platformApps > 0 ? (platformHired / platformApps) * 100 : 0;

  const schoolAppsPerJob = schoolJobs > 0 ? schoolApps / schoolJobs : 0;
  const platformAppsPerJob = platformJobs > 0 ? platformApps / platformJobs : 0;

  const schoolJobsCount = schoolJobs;
  const platformAvgJobs = totalSchools > 0 ? platformJobs / totalSchools : 0;

  return [
    {
      metric: 'Hiring Success Rate',
      schoolValue: Math.round(schoolHiringRate),
      platformAverage: Math.round(platformHiringRate),
      percentile: schoolHiringRate > platformHiringRate ? 75 : 45,
      trend: schoolHiringRate > platformHiringRate ? 'up' : 'down',
      unit: '%',
    },
    {
      metric: 'Applications per Job',
      schoolValue: Math.round(schoolAppsPerJob * 10) / 10,
      platformAverage: Math.round(platformAppsPerJob * 10) / 10,
      percentile: schoolAppsPerJob > platformAppsPerJob ? 70 : 50,
      trend: schoolAppsPerJob > platformAppsPerJob ? 'up' : 'stable',
      unit: 'apps',
    },
    {
      metric: 'Active Job Postings',
      schoolValue: schoolJobsCount,
      platformAverage: Math.round(platformAvgJobs * 10) / 10,
      percentile: schoolJobsCount > platformAvgJobs ? 65 : 40,
      trend: schoolJobsCount > platformAvgJobs ? 'up' : 'down',
      unit: 'jobs',
    },
  ];
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
