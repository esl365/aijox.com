import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  analyzeVideo,
  generateUserFeedback,
  calculateProfileCompleteness,
  analyzeVideoWithRetry,
  type VideoAnalysis,
} from '@/lib/ai/video-analyzer';

// Mock AI SDK
vi.mock('ai', () => ({
  generateObject: vi.fn(),
}));

vi.mock('@/lib/ai/cost-tracker', () => ({
  trackAICost: vi.fn(),
}));

describe('Video Analyzer (Agent 1)', () => {
  const mockAnalysis: VideoAnalysis = {
    accent_type: 'North American',
    accent_clarity_score: 8,
    native_confidence_score: 95,
    energy_level: 'High',
    energy_score: 9,
    professionalism_score: 8,
    technical_quality_score: 7,
    overall_score: 85,
    key_strengths: ['Clear pronunciation', 'Engaging presence'],
    improvement_areas: ['Lighting could be better'],
    summary: 'Excellent candidate with strong teaching presence',
    recommended_for_roles: ['Elementary ESL', 'Middle School English'],
    appearance_professional: true,
    background_appropriate: true,
    lighting_quality: 'Good',
    audio_clarity: 'Excellent',
    confidence_level: 95,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeVideo', () => {
    it('should analyze video and return structured results', async () => {
      const { generateObject } = await import('ai');

      vi.mocked(generateObject).mockResolvedValueOnce({
        object: mockAnalysis,
        usage: { promptTokens: 1000, completionTokens: 200 },
      } as any);

      const result = await analyzeVideo('https://example.com/video.mp4');

      expect(result).toEqual(mockAnalysis);
      expect(result.overall_score).toBeGreaterThanOrEqual(60);
      expect(result.confidence_level).toBeGreaterThan(50);
    });

    it('should throw error for invalid URL', async () => {
      await expect(analyzeVideo('invalid-url')).rejects.toThrow('Invalid video URL');
    });

    it('should track AI cost when userId provided', async () => {
      const { generateObject } = await import('ai');
      const { trackAICost } = await import('@/lib/ai/cost-tracker');

      vi.mocked(generateObject).mockResolvedValueOnce({
        object: mockAnalysis,
        usage: { promptTokens: 1000, completionTokens: 200 },
      } as any);

      await analyzeVideo('https://example.com/video.mp4', 'test-user-id');

      expect(trackAICost).toHaveBeenCalledWith({
        userId: 'test-user-id',
        operation: 'video-analysis',
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 1000,
        outputTokens: 200,
        metadata: expect.objectContaining({
          videoUrl: 'https://example.com/video.mp4',
        }),
      });
    });
  });

  describe('analyzeVideoWithRetry', () => {
    it('should retry on transient failures', async () => {
      const { generateObject } = await import('ai');

      // First 2 calls fail, 3rd succeeds
      vi.mocked(generateObject)
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValueOnce({
          object: mockAnalysis,
          usage: { promptTokens: 1000, completionTokens: 200 },
        } as any);

      const result = await analyzeVideoWithRetry('https://example.com/video.mp4');
      expect(result.overall_score).toBe(85);
      expect(generateObject).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const { generateObject } = await import('ai');

      vi.mocked(generateObject).mockRejectedValue(new Error('persistent failure'));

      await expect(
        analyzeVideoWithRetry('https://example.com/video.mp4', undefined, 2)
      ).rejects.toThrow('Video analysis failed after 2 attempts');
    });
  });

  describe('generateUserFeedback', () => {
    it('should recommend re-recording for scores < 60', () => {
      const lowScoreAnalysis: VideoAnalysis = {
        ...mockAnalysis,
        overall_score: 55,
        lighting_quality: 'Poor',
        audio_clarity: 'Fair',
      };

      const feedback = generateUserFeedback(lowScoreAnalysis);

      expect(feedback.shouldRerecord).toBe(true);
      expect(feedback.message).toContain('recommend re-recording');
      expect(feedback.tips.length).toBeGreaterThan(0);
    });

    it('should provide positive feedback for scores >= 75', () => {
      const feedback = generateUserFeedback(mockAnalysis);

      expect(feedback.shouldRerecord).toBe(false);
      expect(feedback.message).toContain('Excellent');
    });

    it('should suggest lighting improvement if poor', () => {
      const poorLighting: VideoAnalysis = {
        ...mockAnalysis,
        lighting_quality: 'Poor',
      };

      const feedback = generateUserFeedback(poorLighting);

      expect(feedback.tips.some((tip) => tip.includes('lighting'))).toBe(true);
    });

    it('should suggest energy improvement if low', () => {
      const lowEnergy: VideoAnalysis = {
        ...mockAnalysis,
        energy_level: 'Low',
      };

      const feedback = generateUserFeedback(lowEnergy);

      expect(feedback.tips.some((tip) => tip.includes('Energy'))).toBe(true);
    });
  });

  describe('calculateProfileCompleteness', () => {
    it('should calculate correct completeness score', () => {
      const score = calculateProfileCompleteness(
        true, // hasVideo
        mockAnalysis, // videoAnalysis
        true, // hasBasicInfo
        true, // hasExperience
        true // hasCertifications
      );

      // 30 (basic) + 20 (exp) + 10 (certs) + 20 (video) + 17 (85/100 * 20)
      expect(score).toBe(97);
    });

    it('should return lower score without video', () => {
      const score = calculateProfileCompleteness(
        false, // hasVideo
        null, // videoAnalysis
        true, // hasBasicInfo
        true, // hasExperience
        true // hasCertifications
      );

      expect(score).toBe(60); // 30 + 20 + 10 + 0 + 0
    });

    it('should return 0 for empty profile', () => {
      const score = calculateProfileCompleteness(false, null, false, false, false);

      expect(score).toBe(0);
    });

    it('should cap score at 100', () => {
      const perfectAnalysis: VideoAnalysis = {
        ...mockAnalysis,
        overall_score: 100,
      };

      const score = calculateProfileCompleteness(true, perfectAnalysis, true, true, true);

      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
