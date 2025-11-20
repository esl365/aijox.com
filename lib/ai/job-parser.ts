/**
 * AI Job Parser Service
 *
 * Extracts structured data from unstructured job postings using GPT-4o
 * Implements caching to avoid redundant API calls (Phase 3)
 */

import OpenAI from 'openai';
import { createHash } from 'crypto';
import { prisma } from '@/lib/db';

// Lazy initialization to avoid build-time errors
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export type ExtractedJobData = {
  // Basic Info
  title: string;
  schoolName: string;
  country: string;
  city: string;
  subject: string;

  // Compensation
  salaryUSD: number;
  currency: string;
  housingProvided: boolean;
  flightProvided: boolean;
  benefits: string;

  // Contract
  contractLength: number | null;
  startDate: string | null; // ISO date string

  // Requirements
  minYearsExperience: number | null;
  requirements: string;
  educationRequirements: string;
  experienceRequirements: string;

  // Application
  expiresAt: string | null; // ISO date string (application deadline)
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERN';
  externalApplicationUrl: string | null;
  applicationInstructions: string | null;

  // Summary
  extractedSummary: string; // 100-150 word summary for job cards
  fullDescriptionHtml: string; // Formatted HTML version
};

export type ExtractionResult = {
  fields: ExtractedJobData;
  confidence: number; // 0.0-1.0
  warnings: string[]; // Fields AI is uncertain about
  cached: boolean; // Whether result came from cache
};

/**
 * Generate SHA-256 hash of text for caching
 */
function hashText(text: string): string {
  return createHash('sha256').update(text.trim()).digest('hex');
}

/**
 * Extract job fields from unstructured text with caching
 */
export async function extractJobFields(
  rawText: string,
  useCache: boolean = true
): Promise<ExtractionResult> {
  const textHash = hashText(rawText);

  // Phase 3: Check cache first
  if (useCache) {
    const cached = await prisma.aIExtractionCache.findUnique({
      where: { textHash },
    });

    if (cached) {
      // Update cache hit count and last used time
      await prisma.aIExtractionCache.update({
        where: { textHash },
        data: {
          hitCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });

      return {
        fields: cached.extractedData as ExtractedJobData,
        confidence: cached.confidenceScore,
        warnings: cached.warnings,
        cached: true,
      };
    }
  }

  // No cache hit - perform extraction
  const systemPrompt = `You are an expert at extracting structured data from job postings for international teaching positions.

Extract the following fields and return as JSON:

**Basic Info:**
- title (string): Job title (e.g., "ESL Teacher", "IB Math Teacher")
- schoolName (string): Name of the school/institution
- country (string): Country name
- city (string): City name
- subject (string): Primary subject area (English, Math, Science, etc.)

**Compensation:**
- salaryUSD (number): Monthly salary in USD. If given in other currency or hourly, convert to monthly USD equivalent. Use these rates: 1 KRW = 0.00075 USD, 1 CNY = 0.14 USD, 1 AED = 0.27 USD, 1 THB = 0.028 USD. For hourly rates, assume 160 hours/month.
- currency (string): Original currency code (USD, KRW, CNY, AED, etc.)
- housingProvided (boolean): Whether housing/housing allowance is provided
- flightProvided (boolean): Whether flight/flight allowance is provided
- benefits (string): Summary of all benefits (health insurance, pension, vacation, etc.)

**Contract:**
- contractLength (number | null): Contract duration in months (null if not specified)
- startDate (string | null): Start date in ISO format YYYY-MM-DD (null if not specified)

**Requirements:**
- minYearsExperience (number | null): Minimum years of teaching experience required
- requirements (string): Summary of all qualifications and requirements
- educationRequirements (string): Education degree requirements (Bachelor's, Master's, PhD, etc.)
- experienceRequirements (string): Detailed experience requirements

**Application:**
- expiresAt (string | null): Application deadline in ISO format YYYY-MM-DD (null if not specified)
- employmentType (string): One of: FULL_TIME, PART_TIME, CONTRACT, TEMPORARY, INTERN
- externalApplicationUrl (string | null): External application URL (Google Forms, university website, etc.)
- applicationInstructions (string | null): How to apply, required documents, special instructions

**Summary:**
- extractedSummary (string): 100-150 word summary for job listing cards
- fullDescriptionHtml (string): Convert the original job posting to clean HTML with proper formatting (headings, lists, paragraphs, links)

**Meta:**
- confidenceScore (number): 0.0-1.0, how confident you are in the extraction
- warnings (array of strings): List specific fields you're uncertain about (e.g., ["salary conversion may be inaccurate", "start date unclear"])

**Important Guidelines:**
1. For salary conversions, be explicit in warnings if hourly/annual rates need conversion
2. Preserve all external links in fullDescriptionHtml
3. If application instructions mention specific forms, Google Forms, or external websites, extract those URLs
4. For teaching positions in Asia, common subjects are: English, Math, Science, Social Studies, PE, Music, Art, IB subjects
5. If multiple subjects are mentioned, choose the primary one
6. Format fullDescriptionHtml with proper HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <a>, <strong>, <em>

Return ONLY valid JSON with all fields.`;

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: rawText },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1, // Low temperature for consistency
  });

  const extracted = JSON.parse(completion.choices[0].message.content || '{}');

  const result: ExtractionResult = {
    fields: extracted as ExtractedJobData,
    confidence: extracted.confidenceScore || 0.5,
    warnings: extracted.warnings || [],
    cached: false,
  };

  // Phase 3: Cache the result
  if (useCache) {
    await prisma.aIExtractionCache.create({
      data: {
        textHash,
        extractedData: extracted,
        confidenceScore: result.confidence,
        warnings: result.warnings,
        extractionModel: 'gpt-4o',
      },
    });
  }

  return result;
}

/**
 * Batch extract multiple job postings (Phase 3)
 */
export async function batchExtractJobs(
  rawTexts: string[]
): Promise<ExtractionResult[]> {
  // Process in parallel with rate limiting
  const batchSize = 5;
  const results: ExtractionResult[] = [];

  for (let i = 0; i < rawTexts.length; i += batchSize) {
    const batch = rawTexts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((text) => extractJobFields(text))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Clear old cache entries (run as cron job)
 */
export async function clearOldCache(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.aIExtractionCache.deleteMany({
    where: {
      lastUsedAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}
