'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export type RecruiterAnalytics = {
  jobStats: {
    totalJobs: number;
    activeJobs: number;
    closedJobs: number;
    filledJobs: number;
  };
  applicationStats: {
    totalApplications: number;
    newApplications: number;
    screeningApplications: number;
    interviewApplications: number;
    offerApplications: number;
    hiredApplications: number;
    rejectedApplications: number;
  };
  conversionRates: {
    screeningRate: number; // NEW -> SCREENING
    interviewRate: number; // SCREENING -> INTERVIEW
    offerRate: number; // INTERVIEW -> OFFER
    hireRate: number; // OFFER -> HIRED
  };
  topJobs: Array<{
    id: string;
    title: string;
    country: string;
    applicationCount: number;
    hiredCount: number;
    conversionRate: number;
  }>;
  recentActivity: Array<{
    type: 'application' | 'hire' | 'job_posted';
    date: Date;
    jobTitle: string;
    teacherName?: string;
    status?: string;
  }>;
};

export type ApplicationFunnelData = {
  jobId: string;
  jobTitle: string;
  stages: {
    new: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
    rejected: number;
  };
  conversionRates: {
    newToScreening: number;
    screeningToInterview: number;
    interviewToOffer: number;
    offerToHired: number;
  };
  avgTimeInStages: {
    screening: number; // days
    interview: number;
    offer: number;
  };
};

export type AdminAnalytics = {
  platformStats: {
    totalTeachers: number;
    totalRecruiters: number;
    totalSchools: number;
    totalJobs: number;
    totalApplications: number;
    totalReviews: number;
  };
  growthMetrics: {
    newTeachersThisMonth: number;
    newJobsThisMonth: number;
    newApplicationsThisMonth: number;
    teacherGrowthRate: number; // percentage
    jobGrowthRate: number;
  };
  engagementMetrics: {
    avgProfileCompleteness: number;
    teachersWithVideos: number;
    activeJobs: number;
    applicationRate: number; // applications per job
  };
  topCountries: Array<{
    country: string;
    jobCount: number;
    applicationCount: number;
  }>;
};

/**
 * Get analytics for a recruiter
 */
export async function getRecruiterAnalytics(): Promise<RecruiterAnalytics | null> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'RECRUITER') {
    return null;
  }

  // Get recruiter profile
  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!recruiter) {
    return null;
  }

  // Get all jobs by recruiter
  const jobs = await prisma.jobPosting.findMany({
    where: { recruiterId: recruiter.id },
    include: {
      applications: {
        include: {
          teacher: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  // Calculate job stats
  const jobStats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.status === 'ACTIVE').length,
    closedJobs: jobs.filter((j) => j.status === 'CLOSED').length,
    filledJobs: jobs.filter((j) => j.status === 'FILLED').length,
  };

  // Get all applications
  const allApplications = jobs.flatMap((j) => j.applications);

  // Calculate application stats
  const applicationStats = {
    totalApplications: allApplications.length,
    newApplications: allApplications.filter((a) => a.status === 'NEW').length,
    screeningApplications: allApplications.filter((a) => a.status === 'SCREENING').length,
    interviewApplications: allApplications.filter((a) => a.status === 'INTERVIEW').length,
    offerApplications: allApplications.filter((a) => a.status === 'OFFER').length,
    hiredApplications: allApplications.filter((a) => a.status === 'HIRED').length,
    rejectedApplications: allApplications.filter((a) => a.status === 'REJECTED').length,
  };

  // Calculate conversion rates
  const screeningRate =
    applicationStats.newApplications > 0
      ? (applicationStats.screeningApplications / applicationStats.newApplications) * 100
      : 0;
  const interviewRate =
    applicationStats.screeningApplications > 0
      ? (applicationStats.interviewApplications / applicationStats.screeningApplications) * 100
      : 0;
  const offerRate =
    applicationStats.interviewApplications > 0
      ? (applicationStats.offerApplications / applicationStats.interviewApplications) * 100
      : 0;
  const hireRate =
    applicationStats.offerApplications > 0
      ? (applicationStats.hiredApplications / applicationStats.offerApplications) * 100
      : 0;

  const conversionRates = {
    screeningRate: Math.round(screeningRate),
    interviewRate: Math.round(interviewRate),
    offerRate: Math.round(offerRate),
    hireRate: Math.round(hireRate),
  };

  // Calculate top jobs
  const topJobs = jobs
    .map((job) => {
      const applicationCount = job.applications.length;
      const hiredCount = job.applications.filter((a) => a.status === 'HIRED').length;
      const conversionRate =
        applicationCount > 0 ? (hiredCount / applicationCount) * 100 : 0;

      return {
        id: job.id,
        title: job.title,
        country: job.country,
        applicationCount,
        hiredCount,
        conversionRate: Math.round(conversionRate),
      };
    })
    .sort((a, b) => b.applicationCount - a.applicationCount)
    .slice(0, 5);

  // Get recent activity
  const recentApplications = allApplications
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)
    .map((app) => {
      const job = jobs.find((j) => j.id === app.jobId);
      const activityType = app.status === 'HIRED' ? 'hire' : 'application';
      return {
        type: activityType as 'hire' | 'application',
        date: app.status === 'HIRED' ? (app.hiredAt || app.createdAt) : app.createdAt,
        jobTitle: job?.title || 'Unknown Job',
        teacherName: `${app.teacher.firstName} ${app.teacher.lastName}`,
        status: app.status,
      };
    });

  const recentJobPosts = jobs
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((job) => ({
      type: 'job_posted' as const,
      date: job.createdAt,
      jobTitle: job.title,
    }));

  const recentActivity = [...recentApplications, ...recentJobPosts]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  return {
    jobStats,
    applicationStats,
    conversionRates,
    topJobs,
    recentActivity,
  };
}

/**
 * Get application funnel data for a specific job
 */
export async function getApplicationFunnel(
  jobId: string
): Promise<ApplicationFunnelData | null> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'RECRUITER') {
    return null;
  }

  // Get job with applications
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: {
      applications: true,
    },
  });

  if (!job) {
    return null;
  }

  // Verify ownership
  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!recruiter || job.recruiterId !== recruiter.id) {
    return null;
  }

  // Count applications by stage
  const stages = {
    new: job.applications.filter((a) => a.status === 'NEW').length,
    screening: job.applications.filter((a) => a.status === 'SCREENING').length,
    interview: job.applications.filter((a) => a.status === 'INTERVIEW').length,
    offer: job.applications.filter((a) => a.status === 'OFFER').length,
    hired: job.applications.filter((a) => a.status === 'HIRED').length,
    rejected: job.applications.filter((a) => a.status === 'REJECTED').length,
  };

  // Calculate conversion rates
  const conversionRates = {
    newToScreening: stages.new > 0 ? (stages.screening / stages.new) * 100 : 0,
    screeningToInterview:
      stages.screening > 0 ? (stages.interview / stages.screening) * 100 : 0,
    interviewToOffer: stages.interview > 0 ? (stages.offer / stages.interview) * 100 : 0,
    offerToHired: stages.offer > 0 ? (stages.hired / stages.offer) * 100 : 0,
  };

  // Calculate average time in each stage
  const screeningApps = job.applications.filter((a) => a.screenedAt);
  const interviewApps = job.applications.filter((a) => a.interviewedAt);
  const offerApps = job.applications.filter((a) => a.offeredAt);

  const avgTimeInStages = {
    screening:
      screeningApps.length > 0
        ? Math.round(
            screeningApps.reduce((sum, app) => {
              const days =
                (new Date(app.screenedAt!).getTime() -
                  new Date(app.createdAt).getTime()) /
                (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / screeningApps.length
          )
        : 0,
    interview:
      interviewApps.length > 0
        ? Math.round(
            interviewApps.reduce((sum, app) => {
              const days =
                (new Date(app.interviewedAt!).getTime() -
                  new Date(app.screenedAt || app.createdAt).getTime()) /
                (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / interviewApps.length
          )
        : 0,
    offer:
      offerApps.length > 0
        ? Math.round(
            offerApps.reduce((sum, app) => {
              const days =
                (new Date(app.offeredAt!).getTime() -
                  new Date(app.interviewedAt || app.screenedAt || app.createdAt).getTime()) /
                (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / offerApps.length
          )
        : 0,
  };

  return {
    jobId: job.id,
    jobTitle: job.title,
    stages,
    conversionRates: {
      newToScreening: Math.round(conversionRates.newToScreening),
      screeningToInterview: Math.round(conversionRates.screeningToInterview),
      interviewToOffer: Math.round(conversionRates.interviewToOffer),
      offerToHired: Math.round(conversionRates.offerToHired),
    },
    avgTimeInStages,
  };
}

/**
 * Get platform-wide analytics (Admin only)
 */
export async function getAdminAnalytics(): Promise<AdminAnalytics | null> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null;
  }

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Get platform stats
  const [
    totalTeachers,
    totalRecruiters,
    totalSchools,
    totalJobs,
    totalApplications,
    totalReviews,
  ] = await Promise.all([
    prisma.teacherProfile.count(),
    prisma.recruiterProfile.count(),
    prisma.schoolProfile.count(),
    prisma.jobPosting.count(),
    prisma.application.count(),
    prisma.review.count({ where: { status: 'APPROVED' } }),
  ]);

  const platformStats = {
    totalTeachers,
    totalRecruiters,
    totalSchools,
    totalJobs,
    totalApplications,
    totalReviews,
  };

  // Get growth metrics
  const [
    newTeachersThisMonth,
    newJobsThisMonth,
    newApplicationsThisMonth,
    newTeachersLastMonth,
    newJobsLastMonth,
  ] = await Promise.all([
    prisma.teacherProfile.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
    prisma.jobPosting.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
    prisma.application.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
    prisma.teacherProfile.count({
      where: {
        createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfMonth },
      },
    }),
    prisma.jobPosting.count({
      where: {
        createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfMonth },
      },
    }),
  ]);

  const teacherGrowthRate =
    newTeachersLastMonth > 0
      ? ((newTeachersThisMonth - newTeachersLastMonth) / newTeachersLastMonth) * 100
      : 0;
  const jobGrowthRate =
    newJobsLastMonth > 0
      ? ((newJobsThisMonth - newJobsLastMonth) / newJobsLastMonth) * 100
      : 0;

  const growthMetrics = {
    newTeachersThisMonth,
    newJobsThisMonth,
    newApplicationsThisMonth,
    teacherGrowthRate: Math.round(teacherGrowthRate),
    jobGrowthRate: Math.round(jobGrowthRate),
  };

  // Get engagement metrics
  const teachers = await prisma.teacherProfile.findMany({
    select: { profileCompleteness: true, videoUrl: true },
  });

  const avgProfileCompleteness =
    teachers.length > 0
      ? Math.round(
          teachers.reduce((sum, t) => sum + t.profileCompleteness, 0) / teachers.length
        )
      : 0;

  const teachersWithVideos = teachers.filter((t) => t.videoUrl).length;
  const activeJobs = await prisma.jobPosting.count({ where: { status: 'ACTIVE' } });
  const applicationRate = totalJobs > 0 ? totalApplications / totalJobs : 0;

  const engagementMetrics = {
    avgProfileCompleteness,
    teachersWithVideos,
    activeJobs,
    applicationRate: Math.round(applicationRate * 10) / 10,
  };

  // Get top countries
  const jobsByCountry = await prisma.jobPosting.groupBy({
    by: ['country'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  });

  const topCountries = await Promise.all(
    jobsByCountry.map(async (item) => {
      const applicationCount = await prisma.application.count({
        where: {
          job: {
            country: item.country,
          },
        },
      });

      return {
        country: item.country,
        jobCount: item._count.id,
        applicationCount,
      };
    })
  );

  return {
    platformStats,
    growthMetrics,
    engagementMetrics,
    topCountries,
  };
}
