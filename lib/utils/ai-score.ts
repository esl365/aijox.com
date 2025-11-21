/**
 * AI Score calculation utilities for Agent 1 (AI Screener)
 * Calculates composite scores from GPT-4o video analysis
 */

export interface AIAnalysisResult {
  accentClarity: number;
  energyEnthusiasm: number;
  professionalPresentation: number;
  videoTechnicalQuality: number;
  overallAssessment?: string;
  strengths?: string[];
  areasForImprovement?: string[];
}

/**
 * Calculate overall AI score from analysis result
 * Returns average of all 4 metrics (0-100 scale)
 */
export function calculateOverallScore(analysis: AIAnalysisResult | null): number {
  if (!analysis) return 0;

  const { accentClarity, energyEnthusiasm, professionalPresentation, videoTechnicalQuality } = analysis;

  return Math.round(
    (accentClarity + energyEnthusiasm + professionalPresentation + videoTechnicalQuality) / 4
  );
}

/**
 * Get score category (Excellent, Good, Fair, Poor)
 */
export function getScoreCategory(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Get score color for UI display
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get badge variant for score category
 */
export function getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 75) return 'default';
  if (score >= 60) return 'secondary';
  return 'destructive';
}

/**
 * Calculate profile completeness percentage
 * Based on required fields being filled
 */
export function calculateProfileCompleteness(profile: {
  videoUrl?: string | null;
  aiAnalysis?: AIAnalysisResult | null;
  bio?: string | null;
  yearsOfExperience?: number | null;
  subjects?: string[] | null;
  certifications?: string[] | null;
}): number {
  let completed = 0;
  let total = 6;

  if (profile.videoUrl) completed++;
  if (profile.aiAnalysis) completed++;
  if (profile.bio && profile.bio.length > 50) completed++;
  if (profile.yearsOfExperience !== null && profile.yearsOfExperience !== undefined && profile.yearsOfExperience > 0) completed++;
  if (profile.subjects && profile.subjects.length > 0) completed++;
  if (profile.certifications && profile.certifications.length > 0) completed++;

  return Math.round((completed / total) * 100);
}
