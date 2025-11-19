/**
 * AI Agent 2: Autonomous Headhunter - Candidate Filtering
 *
 * Multi-stage filtering pipeline for job matches
 */

import type { TeacherMatch } from '@/lib/db/vector-search';
import type { JobPosting } from '@prisma/client';
import type { VisaCheckResult } from '@/lib/visa/checker';
import { SCORING_CONFIG, getMatchQuality as getMatchQualityHelper } from '@/lib/config/scoring';

export type VisaStatusCache = Record<string, VisaCheckResult>;

export type FilteredCandidate = TeacherMatch & {
  matchReasons: string[];
  matchQuality: 'EXCELLENT' | 'GREAT' | 'GOOD' | 'FAIR';
  recommendationScore: number;
};

export type FilterStats = {
  total: number;
  passedVisa: number;
  passedExperience: number;
  passedSubject: number;
  passedSalary: number;
  final: number;
};

/**
 * Apply multi-stage filters to raw vector search results
 */
export function applyFilters(
  candidates: TeacherMatch[],
  job: JobPosting
): { filtered: FilteredCandidate[]; stats: FilterStats } {
  const stats: FilterStats = {
    total: candidates.length,
    passedVisa: 0,
    passedExperience: 0,
    passedSubject: 0,
    passedSalary: 0,
    final: 0
  };

  const filtered = candidates
    .map(candidate => {
      const reasons: string[] = [];
      let disqualified = false;

      // Stage 1: Visa Eligibility (HARD FILTER)
      const visaCheck = checkVisaEligibility(candidate.visaStatus, job.country);
      if (!visaCheck.eligible) {
        disqualified = true;
      } else {
        stats.passedVisa++;
        reasons.push(`Eligible for ${job.country} visa`);
      }

      // Stage 2: Minimum Experience (HARD FILTER)
      if (job.minYearsExperience && candidate.yearsExperience < job.minYearsExperience) {
        disqualified = true;
      } else {
        stats.passedExperience++;
        if (candidate.yearsExperience >= (job.minYearsExperience || 0) + 3) {
          reasons.push(`${candidate.yearsExperience}+ years of experience (exceeds requirement)`);
        }
      }

      // Stage 3: Subject Match (SOFT FILTER - adds to score)
      const subjectMatch = checkSubjectMatch(candidate.subjects, job.subject, job.requiredSubjects || []);
      if (subjectMatch.hasMatch) {
        stats.passedSubject++;
        reasons.push(`Teaches ${subjectMatch.matchedSubjects.join(', ')}`);
      }

      // Stage 4: Salary Expectations (SOFT FILTER)
      const salaryMatch = checkSalaryExpectations(candidate.minSalaryUSD, job.salaryUSD);
      if (salaryMatch.acceptable) {
        stats.passedSalary++;
        if (salaryMatch.delta && salaryMatch.delta > 0) {
          reasons.push(`Salary is $${salaryMatch.delta}/mo above their minimum`);
        }
      } else {
        // Salary mismatch is a soft disqualifier
        disqualified = true;
      }

      // Stage 5: Location Preference Match
      if (candidate.preferredCountries.includes(job.country)) {
        reasons.push(`Specifically interested in ${job.country}`);
      }

      // Stage 6: Video Quality Bonus
      const videoScore = candidate.videoAnalysis?.overall_score || 0;
      if (videoScore >= 85) {
        reasons.push('Excellent video resume (top 10%)');
      }

      if (disqualified) {
        return null;
      }

      // Calculate overall recommendation score
      const recommendationScore = calculateRecommendationScore(
        candidate.similarity,
        subjectMatch.matchScore,
        salaryMatch.attractiveness,
        videoScore,
        candidate.yearsExperience,
        job.minYearsExperience || 0
      );

      // Determine match quality
      const matchQuality = getMatchQuality(recommendationScore);

      stats.final++;

      return {
        ...candidate,
        matchReasons: reasons,
        matchQuality,
        recommendationScore
      } as FilteredCandidate;
    })
    .filter((c): c is FilteredCandidate => c !== null)
    .sort((a, b) => b.recommendationScore - a.recommendationScore);

  return { filtered, stats };
}

/**
 * Check visa eligibility from cached visaStatus JSON
 */
function checkVisaEligibility(
  visaStatus: VisaStatusCache | null | undefined,
  country: string
): { eligible: boolean; reason?: string } {
  if (!visaStatus || typeof visaStatus !== 'object') {
    // If no visa status calculated, be permissive (will be checked later)
    return { eligible: true };
  }

  const countryStatus = visaStatus[country];

  if (!countryStatus) {
    return { eligible: true }; // Unknown status, allow through
  }

  return {
    eligible: countryStatus.eligible === true,
    reason: countryStatus.failedRequirements?.[0]?.message || 'Visa requirements not met'
  };
}

/**
 * Check subject area match
 */
function checkSubjectMatch(
  teacherSubjects: string[],
  jobSubject: string,
  requiredSubjects: string[]
): {
  hasMatch: boolean;
  matchedSubjects: string[];
  matchScore: number;
} {
  const allRequiredSubjects = [jobSubject, ...requiredSubjects];
  const matched = teacherSubjects.filter(s =>
    allRequiredSubjects.some(req => req.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(req.toLowerCase()))
  );

  return {
    hasMatch: matched.length > 0,
    matchedSubjects: matched,
    matchScore: matched.length / Math.max(allRequiredSubjects.length, 1)
  };
}

/**
 * Check salary expectations
 */
function checkSalaryExpectations(
  teacherMinSalary: number | null | undefined,
  jobSalary: number
): {
  acceptable: boolean;
  delta?: number;
  attractiveness: number;
} {
  if (!teacherMinSalary || teacherMinSalary <= 0) {
    // No preference stated
    return {
      acceptable: true,
      attractiveness: 0.5
    };
  }

  const delta = jobSalary - teacherMinSalary;

  if (delta < 0) {
    // Job pays less than minimum
    return {
      acceptable: false,
      delta,
      attractiveness: 0
    };
  }

  // Calculate attractiveness (0-1 scale)
  // More attractive if job pays significantly above minimum
  const attractiveness = Math.min(delta / teacherMinSalary, 1);

  return {
    acceptable: true,
    delta,
    attractiveness
  };
}

/**
 * Calculate overall recommendation score (0-100)
 * Uses weights from SCORING_CONFIG (lib/config/scoring.ts)
 */
function calculateRecommendationScore(
  similarity: number, // 0-1 from vector search
  subjectMatch: number, // 0-1
  salaryAttractiveness: number, // 0-1
  videoScore: number, // 0-100
  teacherExperience: number,
  requiredExperience: number
): number {
  // Weighted scoring from config
  const weights = SCORING_CONFIG.MATCHING.WEIGHTS;

  // Normalize video score to 0-1
  const normalizedVideo = videoScore / 100;

  // Experience bonus (exceeding requirements is good)
  const experienceBonus = Math.min((teacherExperience - requiredExperience) / 5, 1);

  const score =
    (similarity * weights.SIMILARITY) +
    (subjectMatch * weights.SUBJECT) +
    (salaryAttractiveness * weights.SALARY) +
    (normalizedVideo * weights.VIDEO) +
    (Math.max(experienceBonus, 0) * weights.EXPERIENCE);

  return Math.round(score * 100);
}

/**
 * Categorize match quality
 * Uses thresholds from SCORING_CONFIG (lib/config/scoring.ts)
 */
function getMatchQuality(score: number): 'EXCELLENT' | 'GREAT' | 'GOOD' | 'FAIR' {
  return getMatchQualityHelper(score);
}

/**
 * Generate personalized match reasons for email
 */
export function generateMatchReasons(
  candidate: FilteredCandidate,
  job: JobPosting
): string[] {
  return candidate.matchReasons.slice(0, 3); // Top 3 reasons for brevity
}

/**
 * Deduplication: Remove candidates recently contacted
 */
export async function deduplicateMatches(
  candidates: FilteredCandidate[],
  jobId: string,
  prisma: any
): Promise<FilteredCandidate[]> {
  // Find teachers already notified about this job or similar jobs
  const recentNotifications = await prisma.matchNotification.findMany({
    where: {
      teacherId: { in: candidates.map(c => c.id) },
      sentAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    },
    select: { teacherId: true }
  });

  const notifiedTeacherIds = new Set(recentNotifications.map(n => n.teacherId));

  return candidates.filter(c => !notifiedTeacherIds.has(c.id));
}
