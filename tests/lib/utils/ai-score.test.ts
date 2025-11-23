/**
 * Unit tests for lib/utils/ai-score.ts
 */

import { describe, it, expect } from 'vitest';
import {
  calculateOverallScore,
  getScoreCategory,
  getScoreColor,
  getScoreBadgeVariant,
  calculateProfileCompleteness,
  type AIAnalysisResult,
} from '@/lib/utils/ai-score';

describe('calculateOverallScore', () => {
  it('should return 0 for null analysis', () => {
    expect(calculateOverallScore(null)).toBe(0);
  });

  it('should calculate average of all 4 metrics', () => {
    const analysis: AIAnalysisResult = {
      accentClarity: 80,
      energyEnthusiasm: 90,
      professionalPresentation: 85,
      videoTechnicalQuality: 75,
    };
    // Average: (80 + 90 + 85 + 75) / 4 = 82.5 → 83 (rounded)
    expect(calculateOverallScore(analysis)).toBe(83);
  });

  it('should handle perfect scores', () => {
    const analysis: AIAnalysisResult = {
      accentClarity: 100,
      energyEnthusiasm: 100,
      professionalPresentation: 100,
      videoTechnicalQuality: 100,
    };
    expect(calculateOverallScore(analysis)).toBe(100);
  });

  it('should handle low scores', () => {
    const analysis: AIAnalysisResult = {
      accentClarity: 20,
      energyEnthusiasm: 30,
      professionalPresentation: 25,
      videoTechnicalQuality: 15,
    };
    // Average: (20 + 30 + 25 + 15) / 4 = 22.5 → 23
    expect(calculateOverallScore(analysis)).toBe(23);
  });

  it('should round to nearest integer', () => {
    const analysis: AIAnalysisResult = {
      accentClarity: 81,
      energyEnthusiasm: 82,
      professionalPresentation: 83,
      videoTechnicalQuality: 84,
    };
    // Average: (81 + 82 + 83 + 84) / 4 = 82.5 → 83
    expect(calculateOverallScore(analysis)).toBe(83);
  });

  it('should ignore optional fields', () => {
    const analysis: AIAnalysisResult = {
      accentClarity: 80,
      energyEnthusiasm: 90,
      professionalPresentation: 70,
      videoTechnicalQuality: 60,
      overallAssessment: 'Good performance',
      strengths: ['Clear communication'],
      areasForImprovement: ['Technical setup'],
    };
    // Average: (80 + 90 + 70 + 60) / 4 = 75
    expect(calculateOverallScore(analysis)).toBe(75);
  });
});

describe('getScoreCategory', () => {
  it('should return "Excellent" for scores >= 90', () => {
    expect(getScoreCategory(90)).toBe('Excellent');
    expect(getScoreCategory(95)).toBe('Excellent');
    expect(getScoreCategory(100)).toBe('Excellent');
  });

  it('should return "Good" for scores 75-89', () => {
    expect(getScoreCategory(75)).toBe('Good');
    expect(getScoreCategory(80)).toBe('Good');
    expect(getScoreCategory(89)).toBe('Good');
  });

  it('should return "Fair" for scores 60-74', () => {
    expect(getScoreCategory(60)).toBe('Fair');
    expect(getScoreCategory(65)).toBe('Fair');
    expect(getScoreCategory(74)).toBe('Fair');
  });

  it('should return "Needs Improvement" for scores < 60', () => {
    expect(getScoreCategory(0)).toBe('Needs Improvement');
    expect(getScoreCategory(30)).toBe('Needs Improvement');
    expect(getScoreCategory(59)).toBe('Needs Improvement');
  });
});

describe('getScoreColor', () => {
  it('should return green for scores >= 90', () => {
    expect(getScoreColor(90)).toBe('text-green-600');
    expect(getScoreColor(100)).toBe('text-green-600');
  });

  it('should return blue for scores 75-89', () => {
    expect(getScoreColor(75)).toBe('text-blue-600');
    expect(getScoreColor(85)).toBe('text-blue-600');
  });

  it('should return yellow for scores 60-74', () => {
    expect(getScoreColor(60)).toBe('text-yellow-600');
    expect(getScoreColor(70)).toBe('text-yellow-600');
  });

  it('should return red for scores < 60', () => {
    expect(getScoreColor(0)).toBe('text-red-600');
    expect(getScoreColor(59)).toBe('text-red-600');
  });
});

describe('getScoreBadgeVariant', () => {
  it('should return "default" for scores >= 75', () => {
    expect(getScoreBadgeVariant(75)).toBe('default');
    expect(getScoreBadgeVariant(90)).toBe('default');
    expect(getScoreBadgeVariant(100)).toBe('default');
  });

  it('should return "secondary" for scores 60-74', () => {
    expect(getScoreBadgeVariant(60)).toBe('secondary');
    expect(getScoreBadgeVariant(70)).toBe('secondary');
    expect(getScoreBadgeVariant(74)).toBe('secondary');
  });

  it('should return "destructive" for scores < 60', () => {
    expect(getScoreBadgeVariant(0)).toBe('destructive');
    expect(getScoreBadgeVariant(30)).toBe('destructive');
    expect(getScoreBadgeVariant(59)).toBe('destructive');
  });
});

describe('calculateProfileCompleteness', () => {
  it('should return 0 for completely empty profile', () => {
    const profile = {};
    expect(calculateProfileCompleteness(profile)).toBe(0);
  });

  it('should return 100 for fully complete profile', () => {
    const profile = {
      videoUrl: 'https://example.com/video.mp4',
      aiAnalysis: {
        accentClarity: 80,
        energyEnthusiasm: 90,
        professionalPresentation: 85,
        videoTechnicalQuality: 75,
      },
      bio: 'This is a detailed bio that is definitely longer than 50 characters for testing purposes.',
      yearsOfExperience: 5,
      subjects: ['Math', 'Science'],
      certifications: ['TEFL', 'CELTA'],
    };
    expect(calculateProfileCompleteness(profile)).toBe(100);
  });

  it('should count videoUrl', () => {
    const profile = {
      videoUrl: 'https://example.com/video.mp4',
    };
    // 1 out of 6 = 16.67% → 17%
    expect(calculateProfileCompleteness(profile)).toBe(17);
  });

  it('should not count null videoUrl', () => {
    const profile = {
      videoUrl: null,
    };
    expect(calculateProfileCompleteness(profile)).toBe(0);
  });

  it('should count aiAnalysis', () => {
    const profile = {
      aiAnalysis: {
        accentClarity: 80,
        energyEnthusiasm: 90,
        professionalPresentation: 85,
        videoTechnicalQuality: 75,
      },
    };
    expect(calculateProfileCompleteness(profile)).toBe(17);
  });

  it('should only count bio longer than 50 characters', () => {
    const shortBio = {
      bio: 'Short bio',
    };
    expect(calculateProfileCompleteness(shortBio)).toBe(0);

    const longBio = {
      bio: 'This is a long bio that contains more than 50 characters for completeness.',
    };
    expect(calculateProfileCompleteness(longBio)).toBe(17);
  });

  it('should count yearsOfExperience greater than 0', () => {
    const noExperience = {
      yearsOfExperience: 0,
    };
    expect(calculateProfileCompleteness(noExperience)).toBe(0);

    const withExperience = {
      yearsOfExperience: 3,
    };
    expect(calculateProfileCompleteness(withExperience)).toBe(17);
  });

  it('should handle null and undefined yearsOfExperience', () => {
    const nullExp = {
      yearsOfExperience: null,
    };
    expect(calculateProfileCompleteness(nullExp)).toBe(0);

    const undefinedExp = {
      yearsOfExperience: undefined,
    };
    expect(calculateProfileCompleteness(undefinedExp)).toBe(0);
  });

  it('should count non-empty subjects array', () => {
    const emptySubjects = {
      subjects: [],
    };
    expect(calculateProfileCompleteness(emptySubjects)).toBe(0);

    const withSubjects = {
      subjects: ['Math'],
    };
    expect(calculateProfileCompleteness(withSubjects)).toBe(17);
  });

  it('should count non-empty certifications array', () => {
    const emptyCerts = {
      certifications: [],
    };
    expect(calculateProfileCompleteness(emptyCerts)).toBe(0);

    const withCerts = {
      certifications: ['TEFL'],
    };
    expect(calculateProfileCompleteness(withCerts)).toBe(17);
  });

  it('should calculate partial completion correctly', () => {
    const profile = {
      videoUrl: 'https://example.com/video.mp4',
      bio: 'This is a detailed bio that is definitely longer than 50 characters.',
      subjects: ['Math', 'Science'],
    };
    // 3 out of 6 = 50%
    expect(calculateProfileCompleteness(profile)).toBe(50);
  });
});
