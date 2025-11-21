'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AlertType, AlertCategory } from '@prisma/client';

export interface AlertFilters {
  type?: AlertType;
  category?: AlertCategory;
  read?: boolean;
  limit?: number;
}

export interface CreateAlertData {
  type: AlertType;
  category: AlertCategory;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  jobId?: string;
  applicationId?: string;
}

/**
 * Get alerts for the current school with optional filters
 */
export async function getAlerts(filters?: AlertFilters) {
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

  const where: any = {
    schoolId: schoolProfile.id,
  };

  if (filters?.type) where.type = filters.type;
  if (filters?.category) where.category = filters.category;
  if (filters?.read !== undefined) where.read = filters.read;

  const alerts = await prisma.alert.findMany({
    where,
    orderBy: [
      { read: 'asc' },
      { createdAt: 'desc' },
    ],
    take: filters?.limit || 50,
  });

  return alerts;
}

/**
 * Get count of unread alerts
 */
export async function getUnreadAlertsCount() {
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

  const count = await prisma.alert.count({
    where: {
      schoolId: schoolProfile.id,
      read: false,
    },
  });

  return count;
}

/**
 * Create a new alert
 */
export async function createAlert(data: CreateAlertData) {
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

  const alert = await prisma.alert.create({
    data: {
      schoolId: schoolProfile.id,
      ...data,
    },
  });

  return alert;
}

/**
 * Mark an alert as read
 */
export async function markAlertAsRead(alertId: string) {
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

  const alert = await prisma.alert.update({
    where: {
      id: alertId,
      schoolId: schoolProfile.id,
    },
    data: {
      read: true,
    },
  });

  return alert;
}

/**
 * Mark all alerts as read
 */
export async function markAllAlertsAsRead() {
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

  await prisma.alert.updateMany({
    where: {
      schoolId: schoolProfile.id,
      read: false,
    },
    data: {
      read: true,
    },
  });

  return true;
}

/**
 * Delete an alert
 */
export async function deleteAlert(alertId: string) {
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

  await prisma.alert.delete({
    where: {
      id: alertId,
      schoolId: schoolProfile.id,
    },
  });

  return true;
}

/**
 * Auto-generate smart alerts based on system events
 * This should be called periodically (e.g., via cron job)
 */
export async function generateSmartAlerts(schoolId: string) {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Jobs expiring soon (within 3 days)
  const expiringJobs = await prisma.jobPosting.findMany({
    where: {
      schoolId,
      status: 'ACTIVE',
      expiresAt: {
        lte: threeDaysFromNow,
        gte: now,
      },
    },
  });

  for (const job of expiringJobs) {
    const daysUntilExpiry = Math.ceil(
      ((job.expiresAt?.getTime() || 0) - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if alert already exists
    const existingAlert = await prisma.alert.findFirst({
      where: {
        schoolId,
        category: 'DEADLINE',
        jobId: job.id,
        read: false,
      },
    });

    if (!existingAlert) {
      await prisma.alert.create({
        data: {
          schoolId,
          type: daysUntilExpiry <= 1 ? 'URGENT' : 'TODAY',
          category: 'DEADLINE',
          title: `Job Expiring ${daysUntilExpiry <= 1 ? 'Soon' : `in ${daysUntilExpiry} days`}`,
          description: `Your job posting "${job.title}" will expire soon. Extend or renew to keep it active.`,
          actionLabel: 'Extend Job',
          actionHref: `/school/jobs/${job.id}/edit`,
          jobId: job.id,
        },
      });
    }
  }

  // 2. New applications (unreviewed for > 3 days)
  const pendingApplications = await prisma.application.findMany({
    where: {
      job: {
        schoolId,
      },
      status: 'NEW',
      createdAt: {
        lte: threeDaysAgo,
      },
    },
    include: {
      job: {
        select: {
          title: true,
        },
      },
    },
  });

  if (pendingApplications.length > 0) {
    const existingAlert = await prisma.alert.findFirst({
      where: {
        schoolId,
        category: 'APPLICATION',
        title: {
          contains: 'Applications Need Review',
        },
        read: false,
      },
    });

    if (!existingAlert) {
      await prisma.alert.create({
        data: {
          schoolId,
          type: 'URGENT',
          category: 'APPLICATION',
          title: 'Applications Need Review',
          description: `You have ${pendingApplications.length} application(s) pending review for more than 3 days.`,
          actionLabel: 'Review Applications',
          actionHref: '/school/applications?status=NEW',
        },
      });
    }
  }

  // 3. Interviews scheduled for today
  const todayInterviews = await prisma.interview.findMany({
    where: {
      application: {
        job: {
          schoolId,
        },
      },
      status: 'SCHEDULED',
      scheduledAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      application: {
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
        },
      },
    },
  });

  for (const interview of todayInterviews) {
    const existingAlert = await prisma.alert.findFirst({
      where: {
        schoolId,
        category: 'INTERVIEW',
        applicationId: interview.applicationId,
        read: false,
      },
    });

    if (!existingAlert) {
      await prisma.alert.create({
        data: {
          schoolId,
          type: 'TODAY',
          category: 'INTERVIEW',
          title: 'Interview Today',
          description: `Interview with ${interview.application.teacher.user.name || 'Candidate'} at ${interview.scheduledAt.toLocaleTimeString()}`,
          actionLabel: 'View Details',
          actionHref: `/school/applications/${interview.applicationId}`,
          applicationId: interview.applicationId,
        },
      });
    }
  }

  // 4. Jobs with low application count (< 3 applications after 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lowApplicationJobs = await prisma.jobPosting.findMany({
    where: {
      schoolId,
      status: 'ACTIVE',
      createdAt: {
        lte: sevenDaysAgo,
      },
    },
    include: {
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  for (const job of lowApplicationJobs) {
    if (job._count.applications < 3) {
      const existingAlert = await prisma.alert.findFirst({
        where: {
          schoolId,
          category: 'JOB',
          jobId: job.id,
          title: {
            contains: 'Low Application Rate',
          },
          read: false,
        },
      });

      if (!existingAlert) {
        await prisma.alert.create({
          data: {
            schoolId,
            type: 'INFO',
            category: 'JOB',
            title: 'Low Application Rate',
            description: `Your job "${job.title}" has only ${job._count.applications} application(s) after 7 days. Consider updating the posting or requirements.`,
            actionLabel: 'Edit Job',
            actionHref: `/school/jobs/${job.id}/edit`,
            jobId: job.id,
          },
        });
      }
    }
  }

  return true;
}
