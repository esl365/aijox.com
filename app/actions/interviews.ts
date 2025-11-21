'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InterviewStatus, InterviewType } from '@prisma/client';

export interface TodayInterview {
  id: string;
  scheduledAt: Date;
  duration: number;
  type: InterviewType;
  status: InterviewStatus;
  meetingLink?: string | null;
  candidateName: string;
  jobTitle: string;
  applicationId: string;
}

/**
 * Get today's scheduled interviews
 */
export async function getTodayInterviews(): Promise<TodayInterview[]> {
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const interviews = await prisma.interview.findMany({
    where: {
      application: {
        job: {
          schoolId: schoolProfile.id,
        },
      },
      status: {
        in: ['SCHEDULED', 'RESCHEDULED'],
      },
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
          job: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  });

  return interviews.map((interview) => ({
    id: interview.id,
    scheduledAt: interview.scheduledAt,
    duration: interview.duration,
    type: interview.type,
    status: interview.status,
    meetingLink: interview.meetingLink,
    candidateName: interview.application.teacher.user.name || 'Unknown',
    jobTitle: interview.application.job.title,
    applicationId: interview.applicationId,
  }));
}

/**
 * Get upcoming interviews (next 7 days)
 */
export async function getUpcomingInterviews(): Promise<TodayInterview[]> {
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

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const interviews = await prisma.interview.findMany({
    where: {
      application: {
        job: {
          schoolId: schoolProfile.id,
        },
      },
      status: {
        in: ['SCHEDULED', 'RESCHEDULED'],
      },
      scheduledAt: {
        gte: now,
        lte: nextWeek,
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
          job: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      scheduledAt: 'asc',
    },
    take: 10,
  });

  return interviews.map((interview) => ({
    id: interview.id,
    scheduledAt: interview.scheduledAt,
    duration: interview.duration,
    type: interview.type,
    status: interview.status,
    meetingLink: interview.meetingLink,
    candidateName: interview.application.teacher.user.name || 'Unknown',
    jobTitle: interview.application.job.title,
    applicationId: interview.applicationId,
  }));
}
