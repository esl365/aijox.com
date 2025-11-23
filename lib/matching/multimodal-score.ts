/**
 * Unified Matching Score - Phase 2 Task 1.4
 * Combines Resume Vector + Video Vector + Hard Constraints
 */

export interface MatchingInputs {
  resumeVector?: number[];
  videoVector?: number[];
  hardConstraints: {
    hasRequiredCertification: boolean;
    meetsExperience: boolean;
    visaEligible: boolean;
  };
}

export interface MatchScore {
  overall: number; // 0-100
  breakdown: {
    resumeMatch: number; // 0-100
    videoMatch: number; // 0-100
    constraintMatch: number; // 0-100
  };
  weights: {
    resume: number;
    video: number;
    constraints: number;
  };
}

/**
 * Calculate unified matching score
 * Formula: 0.5 * Resume + 0.3 * Video + 0.2 * Constraints
 */
export function calculateMatchScore(inputs: MatchingInputs): MatchScore {
  const weights = {
    resume: 0.5,
    video: 0.3,
    constraints: 0.2,
  };

  // Resume similarity score (cosine similarity of vectors)
  const resumeMatch = inputs.resumeVector
    ? cosineSimilarity(inputs.resumeVector, inputs.resumeVector) * 100
    : 0;

  // Video similarity score
  const videoMatch = inputs.videoVector
    ? cosineSimilarity(inputs.videoVector, inputs.videoVector) * 100
    : 0;

  // Hard constraints score
  const { hasRequiredCertification, meetsExperience, visaEligible } =
    inputs.hardConstraints;
  const passedConstraints =
    [hasRequiredCertification, meetsExperience, visaEligible].filter(Boolean).length;
  const constraintMatch = (passedConstraints / 3) * 100;

  // Weighted overall score
  const overall =
    weights.resume * resumeMatch +
    weights.video * videoMatch +
    weights.constraints * constraintMatch;

  return {
    overall: Math.round(overall),
    breakdown: {
      resumeMatch: Math.round(resumeMatch),
      videoMatch: Math.round(videoMatch),
      constraintMatch: Math.round(constraintMatch),
    },
    weights,
  };
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}
