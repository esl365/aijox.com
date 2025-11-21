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
