'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { ReviewType, ReviewStatus } from '@prisma/client';

export type CreateReviewInput = {
  reviewType: ReviewType;
  jobId?: string;
  schoolId?: string;
  rating: number;
  title?: string;
  comment: string;
  workPeriod?: string;
};

export type ReviewWithAuthor = {
  id: string;
  createdAt: Date;
  reviewType: ReviewType;
  status: ReviewStatus;
  authorId: string;
  authorName: string | null;
  rating: number;
  title: string | null;
  comment: string;
  workPeriod: string | null;
  isVerified: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  jobId: string | null;
  schoolId: string | null;
};

/**
 * Create a new review for a job or school
 */
export async function createReview(
  input: CreateReviewInput
): Promise<{ success: boolean; error?: string; reviewId?: string }> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
      return { success: false, error: 'Only teachers can create reviews' };
    }

    // Validate rating
    if (input.rating < 1 || input.rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' };
    }

    // Validate comment length
    if (input.comment.length < 20) {
      return { success: false, error: 'Review comment must be at least 20 characters' };
    }

    if (input.comment.length > 5000) {
      return { success: false, error: 'Review comment must not exceed 5000 characters' };
    }

    // Validate that either jobId or schoolId is provided
    if (!input.jobId && !input.schoolId) {
      return { success: false, error: 'Either jobId or schoolId must be provided' };
    }

    // If reviewing a job, verify the teacher applied or worked there
    if (input.jobId) {
      const application = await prisma.application.findFirst({
        where: {
          jobId: input.jobId,
          teacher: {
            userId: session.user.id,
          },
        },
      });

      if (!application) {
        return {
          success: false,
          error: 'You can only review jobs you have applied to',
        };
      }
    }

    // Check if user already reviewed this job/school
    const existingReview = await prisma.review.findFirst({
      where: {
        authorId: session.user.id,
        ...(input.jobId ? { jobId: input.jobId } : {}),
        ...(input.schoolId ? { schoolId: input.schoolId } : {}),
      },
    });

    if (existingReview) {
      return {
        success: false,
        error: 'You have already reviewed this job/school',
      };
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        reviewType: input.reviewType,
        authorId: session.user.id,
        authorName: session.user.name || 'Anonymous Teacher',
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        workPeriod: input.workPeriod,
        jobId: input.jobId,
        schoolId: input.schoolId,
        status: 'PENDING', // Requires moderation
      },
    });

    // Revalidate relevant pages
    if (input.jobId) {
      revalidatePath(`/jobs/${input.jobId}`);
    }
    if (input.schoolId) {
      revalidatePath(`/schools/${input.schoolId}`);
    }

    return { success: true, reviewId: review.id };
  } catch (error) {
    console.error('Error creating review:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create review',
    };
  }
}

/**
 * Get reviews for a specific job
 */
export async function getJobReviews(
  jobId: string,
  statusFilter: ReviewStatus[] = ['APPROVED']
): Promise<ReviewWithAuthor[]> {
  const reviews = await prisma.review.findMany({
    where: {
      jobId,
      status: { in: statusFilter },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return reviews;
}

/**
 * Get reviews for a specific school
 */
export async function getSchoolReviews(
  schoolId: string,
  statusFilter: ReviewStatus[] = ['APPROVED']
): Promise<ReviewWithAuthor[]> {
  const reviews = await prisma.review.findMany({
    where: {
      schoolId,
      status: { in: statusFilter },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return reviews;
}

/**
 * Get review statistics for a job
 */
export async function getJobReviewStats(jobId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      jobId,
      status: 'APPROVED',
    },
    select: {
      rating: true,
    },
  });

  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / reviews.length;

  const ratingDistribution = reviews.reduce(
    (acc, r) => {
      acc[r.rating as 1 | 2 | 3 | 4 | 5]++;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
  );

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews.length,
    ratingDistribution,
  };
}

/**
 * Get review statistics for a school
 */
export async function getSchoolReviewStats(schoolId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      schoolId,
      status: 'APPROVED',
    },
    select: {
      rating: true,
    },
  });

  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / reviews.length;

  const ratingDistribution = reviews.reduce(
    (acc, r) => {
      acc[r.rating as 1 | 2 | 3 | 4 | 5]++;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
  );

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews.length,
    ratingDistribution,
  };
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark review as helpful',
    };
  }
}

/**
 * Mark review as not helpful
 */
export async function markReviewNotHelpful(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        notHelpfulCount: {
          increment: 1,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking review as not helpful:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark review as not helpful',
    };
  }
}

/**
 * Admin: Get all pending reviews for moderation
 */
export async function getPendingReviews(): Promise<ReviewWithAuthor[]> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const reviews = await prisma.review.findMany({
    where: {
      status: 'PENDING',
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return reviews;
}

/**
 * Admin: Approve a review
 */
export async function approveReview(
  reviewId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: 'APPROVED',
        moderatedAt: new Date(),
        moderatedBy: session.user.id,
        moderatorNotes: notes,
      },
    });

    // Revalidate pages
    if (review.jobId) {
      revalidatePath(`/jobs/${review.jobId}`);
    }
    if (review.schoolId) {
      revalidatePath(`/schools/${review.schoolId}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error approving review:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve review',
    };
  }
}

/**
 * Admin: Reject a review
 */
export async function rejectReview(
  reviewId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: 'REJECTED',
        moderatedAt: new Date(),
        moderatedBy: session.user.id,
        moderatorNotes: reason,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting review:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject review',
    };
  }
}
