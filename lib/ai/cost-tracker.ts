/**
 * AI Cost Tracking System
 * Refinement.md:741-778 - Phase 5-3.2
 *
 * Tracks AI usage and enforces monthly quotas
 */

import { prisma } from '@/lib/db';

/**
 * AI Model Pricing (per 1M tokens)
 * Updated: January 2025
 */
export const AI_PRICING = {
  // OpenAI
  'gpt-4o': {
    input: 2.50,    // $2.50 per 1M input tokens
    output: 10.00,  // $10.00 per 1M output tokens
  },
  'gpt-4o-mini': {
    input: 0.15,
    output: 0.60,
  },
  'text-embedding-3-small': {
    input: 0.02,
    output: 0,
  },
  'text-embedding-3-large': {
    input: 0.13,
    output: 0,
  },

  // Anthropic
  'claude-3-5-sonnet-20241022': {
    input: 3.00,    // $3.00 per 1M input tokens
    output: 15.00,  // $15.00 per 1M output tokens
  },
  'claude-3-5-haiku-20241022': {
    input: 0.80,
    output: 4.00,
  },
} as const;

export type AIModel = keyof typeof AI_PRICING;

/**
 * Calculate cost for token usage
 */
export function calculateCost(
  model: AIModel,
  inputTokens: number,
  outputTokens: number = 0
): number {
  const pricing = AI_PRICING[model];
  if (!pricing) {
    console.warn(`Unknown model: ${model}, using default pricing`);
    return 0;
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;

  return inputCost + outputCost;
}

/**
 * Track AI usage in database
 */
export async function trackAICost({
  userId,
  operation,
  provider,
  model,
  inputTokens,
  outputTokens = 0,
  metadata,
}: {
  userId: string;
  operation: 'video-analysis' | 'embedding' | 'email-generation';
  provider: 'openai' | 'anthropic';
  model: string;
  inputTokens: number;
  outputTokens?: number;
  metadata?: Record<string, any>;
}): Promise<void> {
  const totalTokens = inputTokens + outputTokens;
  const costUSD = calculateCost(model as AIModel, inputTokens, outputTokens);

  try {
    await prisma.aIUsage.create({
      data: {
        userId,
        operation,
        provider,
        model,
        tokensUsed: totalTokens,
        costUSD,
        metadata: metadata || null,
      },
    });

    console.log(
      `[AI COST] ${operation} - ${model}: ${totalTokens} tokens = $${costUSD.toFixed(4)} (user: ${userId})`
    );
  } catch (error) {
    // Don't fail the request if cost tracking fails
    console.error('[AI COST ERROR] Failed to track usage:', error);
  }
}

/**
 * Get monthly usage for a user
 */
export async function getMonthlyUsage(userId: string): Promise<{
  totalCost: number;
  totalTokens: number;
  operations: Record<string, { count: number; cost: number; tokens: number }>;
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const usages = await prisma.aIUsage.findMany({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
      },
    },
    select: {
      operation: true,
      tokensUsed: true,
      costUSD: true,
    },
  });

  const totalCost = usages.reduce((sum, u) => sum + u.costUSD, 0);
  const totalTokens = usages.reduce((sum, u) => sum + u.tokensUsed, 0);

  // Group by operation
  const operations: Record<string, { count: number; cost: number; tokens: number }> = {};
  for (const usage of usages) {
    if (!operations[usage.operation]) {
      operations[usage.operation] = { count: 0, cost: 0, tokens: 0 };
    }
    operations[usage.operation].count++;
    operations[usage.operation].cost += usage.costUSD;
    operations[usage.operation].tokens += usage.tokensUsed;
  }

  return { totalCost, totalTokens, operations };
}

/**
 * Check if user exceeded monthly quota
 * Default quota: $10/month per user
 */
export async function checkQuotaExceeded(
  userId: string,
  quotaUSD: number = 10.0
): Promise<{
  exceeded: boolean;
  usage: number;
  quota: number;
  remaining: number;
}> {
  const { totalCost } = await getMonthlyUsage(userId);
  const exceeded = totalCost >= quotaUSD;
  const remaining = Math.max(0, quotaUSD - totalCost);

  return {
    exceeded,
    usage: totalCost,
    quota: quotaUSD,
    remaining,
  };
}

/**
 * Get usage statistics for admin dashboard
 */
export async function getUsageStats(startDate?: Date, endDate?: Date) {
  const where = startDate || endDate
    ? {
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      }
    : {};

  const stats = await prisma.aIUsage.aggregate({
    where,
    _sum: {
      tokensUsed: true,
      costUSD: true,
    },
    _count: true,
  });

  const byOperation = await prisma.aIUsage.groupBy({
    by: ['operation'],
    where,
    _sum: {
      tokensUsed: true,
      costUSD: true,
    },
    _count: true,
  });

  const byModel = await prisma.aIUsage.groupBy({
    by: ['model'],
    where,
    _sum: {
      tokensUsed: true,
      costUSD: true,
    },
    _count: true,
  });

  return {
    total: {
      requests: stats._count,
      tokens: stats._sum.tokensUsed || 0,
      cost: stats._sum.costUSD || 0,
    },
    byOperation,
    byModel,
  };
}
