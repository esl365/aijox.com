'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ActivityType } from '@prisma/client';

export interface CreateActivityData {
  type: ActivityType;
  title: string;
  description: string;
  metadata?: any;
  jobId?: string;
  applicationId?: string;
  userId?: string;
}

/**
 * Get activity feed for the current school
 */
export async function getActivityFeed(limit: number = 20) {
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

  const activities = await prisma.activity.findMany({
    where: {
      schoolId: schoolProfile.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  return activities;
}

/**
 * Create a new activity
 */
export async function createActivity(schoolId: string, data: CreateActivityData) {
  const activity = await prisma.activity.create({
    data: {
      schoolId,
      ...data,
    },
  });

  return activity;
}

/**
 * Helper functions to create activities for specific events
 */

export async function logApplicationReceived(
  schoolId: string,
  applicationId: string,
  candidateName: string,
  jobTitle: string
) {
  return createActivity(schoolId, {
    type: 'APPLICATION_RECEIVED',
    title: 'New Application Received',
    description: `${candidateName} applied for ${jobTitle}`,
    applicationId,
    metadata: { candidateName, jobTitle },
  });
}

export async function logApplicationApproved(
  schoolId: string,
  applicationId: string,
  candidateName: string,
  jobTitle: string
) {
  return createActivity(schoolId, {
    type: 'APPLICATION_APPROVED',
    title: 'Application Approved',
    description: `${candidateName}'s application for ${jobTitle} was approved`,
    applicationId,
    metadata: { candidateName, jobTitle },
  });
}

export async function logApplicationRejected(
  schoolId: string,
  applicationId: string,
  candidateName: string,
  jobTitle: string
) {
  return createActivity(schoolId, {
    type: 'APPLICATION_REJECTED',
    title: 'Application Rejected',
    description: `${candidateName}'s application for ${jobTitle} was rejected`,
    applicationId,
    metadata: { candidateName, jobTitle },
  });
}

export async function logApplicationShortlisted(
  schoolId: string,
  applicationId: string,
  candidateName: string,
  jobTitle: string
) {
  return createActivity(schoolId, {
    type: 'APPLICATION_SHORTLISTED',
    title: 'Candidate Shortlisted',
    description: `${candidateName} was shortlisted for ${jobTitle}`,
    applicationId,
    metadata: { candidateName, jobTitle },
  });
}

export async function logInterviewScheduled(
  schoolId: string,
  applicationId: string,
  candidateName: string,
  scheduledAt: Date
) {
  return createActivity(schoolId, {
    type: 'INTERVIEW_SCHEDULED',
    title: 'Interview Scheduled',
    description: `Interview scheduled with ${candidateName} for ${scheduledAt.toLocaleDateString()} at ${scheduledAt.toLocaleTimeString()}`,
    applicationId,
    metadata: { candidateName, scheduledAt: scheduledAt.toISOString() },
  });
}

export async function logInterviewCompleted(
  schoolId: string,
  applicationId: string,
  candidateName: string,
  rating?: number
) {
  return createActivity(schoolId, {
    type: 'INTERVIEW_COMPLETED',
    title: 'Interview Completed',
    description: `Interview with ${candidateName} completed${rating ? ` - Rating: ${rating}/5` : ''}`,
    applicationId,
    metadata: { candidateName, rating },
  });
}

export async function logJobPosted(
  schoolId: string,
  jobId: string,
  jobTitle: string
) {
  return createActivity(schoolId, {
    type: 'JOB_POSTED',
    title: 'New Job Posted',
    description: `${jobTitle} has been posted`,
    jobId,
    metadata: { jobTitle },
  });
}

export async function logJobUpdated(
  schoolId: string,
  jobId: string,
  jobTitle: string
) {
  return createActivity(schoolId, {
    type: 'JOB_UPDATED',
    title: 'Job Updated',
    description: `${jobTitle} has been updated`,
    jobId,
    metadata: { jobTitle },
  });
}

export async function logJobExpired(
  schoolId: string,
  jobId: string,
  jobTitle: string
) {
  return createActivity(schoolId, {
    type: 'JOB_EXPIRED',
    title: 'Job Expired',
    description: `${jobTitle} has expired`,
    jobId,
    metadata: { jobTitle },
  });
}

export async function logCandidateHired(
  schoolId: string,
  applicationId: string,
  candidateName: string,
  jobTitle: string
) {
  return createActivity(schoolId, {
    type: 'CANDIDATE_HIRED',
    title: 'Candidate Hired',
    description: `${candidateName} has been hired for ${jobTitle}`,
    applicationId,
    metadata: { candidateName, jobTitle },
  });
}
