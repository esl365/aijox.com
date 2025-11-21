'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateOverallScore, type AIAnalysisResult } from '@/lib/utils/ai-score';

export interface TopRatedCandidate {
  id: string;
  name: string;
  videoUrl: string | null;
  overallScore: number;
  aiAnalysis: AIAnalysisResult | null;
  appliedFor: string;
  appliedDate: Date;
}

export interface MatchQualityMetrics {
  averageSimilarityScore: number;
  totalMatches: number;
  emailsSent: number;
  emailsDelivered: number;
  matchesPerJob: {
    jobTitle: string;
    matchCount: number;
    avgScore: number;
  }[];
}

export interface VisaEligibilityMetrics {
  totalApplications: number;
  eligibleCount: number;
  ineligibleCount: number;
  byCountry: {
    country: string;
    eligible: number;
    ineligible: number;
    totalFor: number;
  }[];
}

/**
 * Get top-rated candidates based on AI video analysis scores
 * (Agent 1: AI Screener integration)
 *
 * NOTE: Returns empty array until AI analysis schema fields are implemented
 */
export async function getTopRatedCandidates(limit: number = 6): Promise<TopRatedCandidate[]> {
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

  // TODO: Implement when aiAnalysis field is added to TeacherProfile schema
  // For now, return empty array to prevent type errors
  return [];
}

/**
 * Get match quality metrics from Agent 2 (Autonomous Headhunter)
 *
 * NOTE: Returns empty metrics until JobMatch model is implemented
 */
export async function getMatchQualityMetrics(): Promise<MatchQualityMetrics> {
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

  // TODO: Implement when JobMatch model is added to schema
  // For now, return empty metrics to prevent type errors
  return {
    averageSimilarityScore: 0,
    totalMatches: 0,
    emailsSent: 0,
    emailsDelivered: 0,
    matchesPerJob: [],
  };
}

/**
 * Get visa eligibility overview from Agent 3 (Visa Guard)
 *
 * NOTE: Returns empty metrics until visaEligibility field is implemented
 */
export async function getVisaEligibilityMetrics(): Promise<VisaEligibilityMetrics> {
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

  // TODO: Implement when visaEligibility field is added to TeacherProfile schema
  // For now, return empty metrics to prevent type errors
  return {
    totalApplications: 0,
    eligibleCount: 0,
    ineligibleCount: 0,
    byCountry: [],
  };
}
