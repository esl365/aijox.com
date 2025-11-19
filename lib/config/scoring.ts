/**
 * Centralized Configuration for Scoring and Thresholds
 *
 * Refinement.md:370-410
 * Converts magic numbers to maintainable constants
 */

export const SCORING_CONFIG = {
  /**
   * Video Analysis Scoring Thresholds
   * Used by: lib/ai/video-analyzer.ts
   */
  VIDEO_ANALYSIS: {
    // Score interpretation thresholds (1-100 scale)
    MIN_ACCEPTABLE_SCORE: 60,
    GOOD_SCORE_THRESHOLD: 75,
    EXCELLENT_SCORE_THRESHOLD: 85,

    // Component weights for overall score calculation
    WEIGHTS: {
      ACCENT_CLARITY: 0.3,
      ENERGY: 0.25,
      PROFESSIONALISM: 0.25,
      TECHNICAL_QUALITY: 0.2,
    },

    // Individual component scoring ranges (1-10 scale)
    COMPONENT_RANGES: {
      POOR: [1, 3],
      AVERAGE: [4, 6],
      GOOD: [7, 8],
      EXCELLENT: [9, 10],
    },

    // AI model parameters
    AI_TEMPERATURE: 0.3, // Low temperature for consistency
    MAX_TOKENS: 1500,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 2000,
  },

  /**
   * Job Matching and Filtering Configuration
   * Used by: lib/matching/filter-candidates.ts, app/actions/match-teachers.ts
   */
  MATCHING: {
    // Vector similarity thresholds (0-1 scale)
    DEFAULT_MIN_SIMILARITY: 0.85,
    RELAXED_MIN_SIMILARITY: 0.75, // For hybrid search
    STRICT_MIN_SIMILARITY: 0.90,  // For premium matches

    // Result limits
    DEFAULT_MAX_CANDIDATES: 20,
    HYBRID_SEARCH_LIMIT: 50,
    PREVIEW_LIMIT: 5,

    // Recommendation score weights (must sum to 1.0)
    WEIGHTS: {
      SIMILARITY: 0.40,    // Vector embedding similarity - most important
      SUBJECT: 0.20,       // Subject area match
      SALARY: 0.15,        // Salary alignment
      VIDEO: 0.15,         // Video quality score
      EXPERIENCE: 0.10,    // Years of experience bonus
    },

    // Match quality classification (0-100 scale)
    QUALITY_THRESHOLDS: {
      EXCELLENT: 90, // Top 5% matches
      GREAT: 80,     // Top 20% matches
      GOOD: 70,      // Top 50% matches
      FAIR: 60,      // Acceptable matches
      // Below 60 = filtered out
    },

    // Profile completeness requirements
    MIN_PROFILE_COMPLETENESS: 70,
    MIN_PROFILE_COMPLETENESS_RELAXED: 60,

    // Experience multipliers
    EXPERIENCE_BONUS_THRESHOLD: 3, // Years above requirement for bonus
    EXPERIENCE_MAX_BONUS_POINTS: 10,
  },

  /**
   * Visa Status Caching Configuration
   * Used by: app/actions/check-visa.ts
   */
  VISA: {
    // Cache duration in days
    CACHE_DURATION_DAYS: 30,
    CACHE_DURATION_MS: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds

    // Confidence thresholds for visa eligibility
    MIN_CONFIDENCE: 80, // 0-100 scale
  },

  /**
   * Search Ranking Configuration
   * Used by: prisma schema for searchRank field
   */
  SEARCH_RANK: {
    HIGH_THRESHOLD: 75,   // Video score >= 75 -> HIGH rank
    MEDIUM_THRESHOLD: 60, // Video score >= 60 -> MEDIUM rank
    // Below 60 -> LOW rank
  },

  /**
   * Deduplication Settings
   * Used by: lib/matching/filter-candidates.ts - deduplicateMatches()
   */
  DEDUPLICATION: {
    // Don't contact same teacher within X days for same job
    DAYS_UNTIL_RECONTACT: 90,
    DAYS_UNTIL_RECONTACT_MS: 90 * 24 * 60 * 60 * 1000,
  },

  /**
   * Salary Matching Configuration
   * Used by: lib/matching/filter-candidates.ts - checkSalaryExpectations()
   */
  SALARY: {
    // Acceptable variance below teacher's minimum (as percentage)
    ACCEPTABLE_BELOW_MIN_PERCENT: 5, // Job can be 5% below teacher's min

    // Bonus scoring for salary above minimum
    ATTRACTIVENESS_MULTIPLIER: 0.1, // +10 points per $1000 above minimum
    MAX_SALARY_BONUS: 25, // Cap bonus at 25 points
  },
} as const;

/**
 * Type helper for config values
 */
export type ScoringConfig = typeof SCORING_CONFIG;

/**
 * Helper functions for common scoring operations
 */

export function getMatchQuality(score: number): 'EXCELLENT' | 'GREAT' | 'GOOD' | 'FAIR' {
  if (score >= SCORING_CONFIG.MATCHING.QUALITY_THRESHOLDS.EXCELLENT) return 'EXCELLENT';
  if (score >= SCORING_CONFIG.MATCHING.QUALITY_THRESHOLDS.GREAT) return 'GREAT';
  if (score >= SCORING_CONFIG.MATCHING.QUALITY_THRESHOLDS.GOOD) return 'GOOD';
  return 'FAIR';
}

export function getVideoQuality(score: number): 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR' {
  if (score >= SCORING_CONFIG.VIDEO_ANALYSIS.EXCELLENT_SCORE_THRESHOLD) return 'EXCELLENT';
  if (score >= SCORING_CONFIG.VIDEO_ANALYSIS.GOOD_SCORE_THRESHOLD) return 'GOOD';
  if (score >= SCORING_CONFIG.VIDEO_ANALYSIS.MIN_ACCEPTABLE_SCORE) return 'ACCEPTABLE';
  return 'POOR';
}

export function getSearchRank(videoScore: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (videoScore >= SCORING_CONFIG.SEARCH_RANK.HIGH_THRESHOLD) return 'HIGH';
  if (videoScore >= SCORING_CONFIG.SEARCH_RANK.MEDIUM_THRESHOLD) return 'MEDIUM';
  return 'LOW';
}

export function isProfileComplete(completeness: number, relaxed: boolean = false): boolean {
  const threshold = relaxed
    ? SCORING_CONFIG.MATCHING.MIN_PROFILE_COMPLETENESS_RELAXED
    : SCORING_CONFIG.MATCHING.MIN_PROFILE_COMPLETENESS;
  return completeness >= threshold;
}

export function shouldRecontact(lastContactedAt: Date | null): boolean {
  if (!lastContactedAt) return true;

  const daysSinceContact = (Date.now() - lastContactedAt.getTime()) / (24 * 60 * 60 * 1000);
  return daysSinceContact >= SCORING_CONFIG.DEDUPLICATION.DAYS_UNTIL_RECONTACT;
}
