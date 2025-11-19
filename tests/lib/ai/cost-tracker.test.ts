import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateCost,
  trackAICost,
  getMonthlyUsage,
  checkQuotaExceeded,
  AI_PRICING,
} from '@/lib/ai/cost-tracker';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    aIUsage: {
      create: vi.fn(),
      findMany: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

describe('AI Cost Tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateCost', () => {
    it('should calculate GPT-4o cost correctly', () => {
      const cost = calculateCost('gpt-4o', 1_000_000, 500_000);

      // ($2.50 * 1M input) + ($10.00 * 0.5M output)
      expect(cost).toBe(7.50);
    });

    it('should calculate embedding cost correctly', () => {
      const cost = calculateCost('text-embedding-3-small', 50_000, 0);

      // $0.02 * 0.05M = $0.001
      expect(cost).toBe(0.001);
    });

    it('should calculate Claude cost correctly', () => {
      const cost = calculateCost('claude-3-5-sonnet-20241022', 1_000_000, 1_000_000);

      // ($3.00 * 1M) + ($15.00 * 1M) = $18.00
      expect(cost).toBe(18.00);
    });

    it('should handle zero tokens', () => {
      const cost = calculateCost('gpt-4o', 0, 0);
      expect(cost).toBe(0);
    });

    it('should warn about unknown models', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const cost = calculateCost('unknown-model' as any, 1000, 0);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown model')
      );
      expect(cost).toBe(0);

      consoleSpy.mockRestore();
    });
  });

  describe('trackAICost', () => {
    it('should create AIUsage record in database', async () => {
      const { prisma } = await import('@/lib/db');

      vi.mocked(prisma.aIUsage.create).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.aIUsage.findMany).mockResolvedValueOnce([]);

      await trackAICost({
        userId: 'test-user',
        operation: 'video-analysis',
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 1000,
        outputTokens: 200,
        metadata: { test: 'data' },
      });

      expect(prisma.aIUsage.create).toHaveBeenCalledWith({
        data: {
          userId: 'test-user',
          operation: 'video-analysis',
          provider: 'openai',
          model: 'gpt-4o',
          tokensUsed: 1200,
          costUSD: expect.any(Number),
          metadata: { test: 'data' },
        },
      });
    });

    it('should not throw error on database failure', async () => {
      const { prisma } = await import('@/lib/db');

      vi.mocked(prisma.aIUsage.create).mockRejectedValueOnce(new Error('DB error'));
      vi.mocked(prisma.aIUsage.findMany).mockResolvedValueOnce([]);

      // Should not throw
      await expect(
        trackAICost({
          userId: 'test-user',
          operation: 'embedding',
          provider: 'openai',
          model: 'text-embedding-3-small',
          inputTokens: 100,
        })
      ).resolves.not.toThrow();
    });
  });

  describe('getMonthlyUsage', () => {
    it('should calculate total monthly cost', async () => {
      const { prisma } = await import('@/lib/db');

      const mockUsages = [
        { operation: 'video-analysis', tokensUsed: 1200, costUSD: 0.015 },
        { operation: 'embedding', tokensUsed: 50, costUSD: 0.001 },
        { operation: 'email-generation', tokensUsed: 300, costUSD: 0.005 },
      ];

      vi.mocked(prisma.aIUsage.findMany).mockResolvedValueOnce(mockUsages as any);

      const result = await getMonthlyUsage('test-user');

      expect(result.totalCost).toBe(0.021);
      expect(result.totalTokens).toBe(1550);
      expect(result.operations).toHaveProperty('video-analysis');
      expect(result.operations['video-analysis'].count).toBe(1);
    });

    it('should return zero for no usage', async () => {
      const { prisma } = await import('@/lib/db');

      vi.mocked(prisma.aIUsage.findMany).mockResolvedValueOnce([]);

      const result = await getMonthlyUsage('test-user');

      expect(result.totalCost).toBe(0);
      expect(result.totalTokens).toBe(0);
      expect(Object.keys(result.operations)).toHaveLength(0);
    });
  });

  describe('checkQuotaExceeded', () => {
    it('should return exceeded=true when over quota', async () => {
      const { prisma } = await import('@/lib/db');

      const mockUsages = Array(100).fill({
        operation: 'video-analysis',
        tokensUsed: 1000,
        costUSD: 0.15, // Total: $15.00
      });

      vi.mocked(prisma.aIUsage.findMany).mockResolvedValueOnce(mockUsages as any);

      const result = await checkQuotaExceeded('test-user', 10.0);

      expect(result.exceeded).toBe(true);
      expect(result.usage).toBe(15.0);
      expect(result.quota).toBe(10.0);
      expect(result.remaining).toBe(0);
    });

    it('should return exceeded=false when under quota', async () => {
      const { prisma } = await import('@/lib/db');

      const mockUsages = [
        { operation: 'embedding', tokensUsed: 100, costUSD: 0.002 },
      ];

      vi.mocked(prisma.aIUsage.findMany).mockResolvedValueOnce(mockUsages as any);

      const result = await checkQuotaExceeded('test-user', 10.0);

      expect(result.exceeded).toBe(false);
      expect(result.usage).toBe(0.002);
      expect(result.remaining).toBeCloseTo(9.998, 3);
    });

    it('should use default quota of $10', async () => {
      const { prisma } = await import('@/lib/db');

      vi.mocked(prisma.aIUsage.findMany).mockResolvedValueOnce([]);

      const result = await checkQuotaExceeded('test-user');

      expect(result.quota).toBe(10.0);
    });
  });
});
