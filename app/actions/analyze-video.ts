/**
 * Server Actions for Agent 1: AI Screener
 *
 * Handles video analysis workflow:
 * 1. Trigger analysis after upload
 * 2. Update database with results
 * 3. Notify teacher
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { analyzeVideoWithRetry, generateUserFeedback, calculateProfileCompleteness } from '@/lib/ai/video-analyzer';
import { notifyTeacherVideoAnalyzed } from '@/lib/email/notifications';
import { videoAnalysisRateLimit, checkRateLimit } from '@/lib/rate-limit';
import { getSearchRank } from '@/lib/config/scoring';

export type AnalysisResult = {
  success: boolean;
  message: string;
  analysis?: any;
  error?: string;
};

/**
 * Main entry point for video analysis
 * Called by UploadThing webhook or manual trigger
 */
export async function analyzeTeacherVideo(profileId: string): Promise<AnalysisResult> {
  try {
    // 1. Fetch profile with video URL
    const profile = await prisma.teacherProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        videoUrl: true,
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        subjects: true,
        yearsExperience: true,
        certifications: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });

    if (!profile) {
      return {
        success: false,
        error: 'Profile not found',
        message: 'Teacher profile does not exist.'
      };
    }

    if (!profile.videoUrl) {
      return {
        success: false,
        error: 'No video found',
        message: 'Please upload a video first.'
      };
    }

    // 2. Update status to analyzing
    await prisma.teacherProfile.update({
      where: { id: profileId },
      data: {
        videoAnalysisStatus: 'ANALYZING'
      }
    });

    // 3. Call AI analysis with retry logic
    const analysis = await analyzeVideoWithRetry(profile.videoUrl);

    // 4. Calculate profile completeness
    const completeness = calculateProfileCompleteness(
      true, // hasVideo
      analysis,
      !!(profile.firstName && profile.lastName && profile.email),
      !!profile.yearsExperience,
      profile.certifications.length > 0
    );

    // 5. Update profile with results
    const updated = await prisma.teacherProfile.update({
      where: { id: profileId },
      data: {
        videoAnalysis: analysis,
        videoAnalysisStatus: 'COMPLETED',
        lastAnalyzedAt: new Date(),
        profileCompleteness: completeness,
        // Update search ranking based on video quality (uses SCORING_CONFIG)
        searchRank: getSearchRank(analysis.overall_score)
      }
    });

    // 6. Generate user-friendly feedback
    const feedback = generateUserFeedback(analysis);

    // 7. Send notification email
    await notifyTeacherVideoAnalyzed(profile.user.email, {
      firstName: profile.firstName,
      score: analysis.overall_score,
      feedback: feedback.message,
      tips: feedback.tips,
      shouldRerecord: feedback.shouldRerecord
    });

    // 8. Revalidate profile page
    revalidatePath(`/profile/${profileId}`);
    revalidatePath('/profile/edit');

    return {
      success: true,
      message: feedback.message,
      analysis: {
        ...analysis,
        feedback,
        completeness
      }
    };

  } catch (error: any) {
    console.error('Video analysis failed:', error);

    // Update profile with error status
    await prisma.teacherProfile.update({
      where: { id: profileId },
      data: {
        videoAnalysisStatus: 'FAILED',
        videoAnalysisError: error.message
      }
    }).catch(console.error);

    return {
      success: false,
      error: error.message,
      message: 'Video analysis failed. Please try again or contact support.'
    };
  }
}

/**
 * Manual re-analysis trigger
 * Allows teachers to request new analysis (e.g., after re-uploading)
 *
 * Rate Limiting: 5 requests per hour (Refinement.md:430)
 */
export async function requestVideoReanalysis(): Promise<AnalysisResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Unauthorized',
      message: 'Please sign in to continue.'
    };
  }

  // Rate limiting: 5 requests per hour per user
  const rateLimitResult = await checkRateLimit(
    videoAnalysisRateLimit,
    session.user.id,
    'video-analysis'
  );

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: 'Rate limited',
      message: rateLimitResult.error
    };
  }

  // Find teacher profile
  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, lastAnalyzedAt: true }
  });

  if (!profile) {
    return {
      success: false,
      error: 'Profile not found',
      message: 'Teacher profile does not exist.'
    };
  }

  // Trigger analysis
  return analyzeTeacherVideo(profile.id);
}

/**
 * Get analysis results for a profile
 */
export async function getVideoAnalysis(profileId: string) {
  const session = await auth();

  const profile = await prisma.teacherProfile.findUnique({
    where: { id: profileId },
    select: {
      id: true,
      userId: true,
      videoUrl: true,
      videoAnalysis: true,
      videoAnalysisStatus: true,
      videoAnalysisError: true,
      lastAnalyzedAt: true,
      profileCompleteness: true
    }
  });

  if (!profile) {
    return null;
  }

  // Privacy check: Only owner or recruiters can see full analysis
  const isOwner = session?.user?.id === profile.userId;
  const isRecruiter = session?.user?.role === 'RECRUITER' || session?.user?.role === 'ADMIN';

  if (!isOwner && !isRecruiter) {
    // Return limited data for public view
    return {
      hasVideo: !!profile.videoUrl,
      overallScore: profile.videoAnalysis?.overall_score || null,
      status: profile.videoAnalysisStatus
    };
  }

  return {
    ...profile,
    feedback: profile.videoAnalysis ? generateUserFeedback(profile.videoAnalysis as any) : null
  };
}

/**
 * Batch analysis for multiple profiles
 * Used by admin for re-processing or initial seeding
 */
export async function batchAnalyzeVideos(profileIds: string[]): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: AnalysisResult[];
}> {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin only');
  }

  const results: AnalysisResult[] = [];
  let successful = 0;
  let failed = 0;

  // Process in batches to avoid overwhelming the AI API
  const BATCH_SIZE = 5;

  for (let i = 0; i < profileIds.length; i += BATCH_SIZE) {
    const batch = profileIds.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(id => analyzeTeacherVideo(id))
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
        if (result.value.success) successful++;
        else failed++;
      } else {
        results.push({
          success: false,
          error: result.reason?.message || 'Unknown error',
          message: 'Analysis failed'
        });
        failed++;
      }
    }

    // Rate limiting delay between batches
    if (i + BATCH_SIZE < profileIds.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return {
    total: profileIds.length,
    successful,
    failed,
    results
  };
}
