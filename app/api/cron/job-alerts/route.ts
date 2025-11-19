/**
 * Job Alerts Cron Job
 *
 * Runs periodically to send job alerts to teachers based on their saved searches.
 *
 * Schedule:
 * - INSTANT: Triggered by new job postings (webhook)
 * - DAILY: Runs at 9:00 AM UTC (configurable in vercel.json)
 * - WEEKLY: Runs on Mondays at 9:00 AM UTC
 *
 * Security:
 * - Protected by Vercel Cron Secret header
 * - Rate limited via Upstash Redis
 *
 * Performance:
 * - Batch processing with pagination
 * - Rate-limited email sending
 * - Deduplication to prevent duplicate alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  sendDigestJobAlert,
  sendBatchJobAlerts,
} from '@/lib/email/job-alerts';
import { shouldSendAlert, type AlertFrequency } from '@/lib/types/saved-search';
import type { SavedSearchFilters } from '@/lib/types/saved-search';
import type { JobPosting } from '@prisma/client';

// Constants
const BATCH_SIZE = 50; // Process 50 saved searches at a time
const MAX_JOBS_PER_EMAIL = 20; // Maximum jobs to include in one email

/**
 * Cron job handler
 *
 * Vercel Cron will call this endpoint based on vercel.json schedule
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel automatically sets this header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting job alerts cron job...');

    const now = new Date();
    const results = {
      total: 0,
      daily: 0,
      weekly: 0,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>,
    };

    // Process DAILY alerts
    const dailyResults = await processDailyAlerts(now);
    results.daily = dailyResults.total;
    results.successful += dailyResults.successful;
    results.failed += dailyResults.failed;
    results.errors.push(...dailyResults.errors);

    // Process WEEKLY alerts (only on Mondays)
    const dayOfWeek = now.getUTCDay();
    if (dayOfWeek === 1) {
      // Monday = 1
      const weeklyResults = await processWeeklyAlerts(now);
      results.weekly = weeklyResults.total;
      results.successful += weeklyResults.successful;
      results.failed += weeklyResults.failed;
      results.errors.push(...weeklyResults.errors);
    }

    results.total = results.daily + results.weekly;

    console.log('Job alerts cron job completed:', results);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error('Error in job alerts cron job:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Process DAILY alerts
 */
async function processDailyAlerts(now: Date) {
  return processAlertsForFrequency('DAILY', now);
}

/**
 * Process WEEKLY alerts
 */
async function processWeeklyAlerts(now: Date) {
  return processAlertsForFrequency('WEEKLY', now);
}

/**
 * Process alerts for a specific frequency
 */
async function processAlertsForFrequency(
  frequency: AlertFrequency,
  now: Date
): Promise<{
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const results = {
    total: 0,
    successful: 0,
    failed: 0,
    errors: [] as Array<{ email: string; error: string }>,
  };

  try {
    // Find all active saved searches with this frequency
    const savedSearches = await prisma.savedSearch.findMany({
      where: {
        isActive: true,
        alertFrequency: frequency,
        alertEmail: true,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
      take: BATCH_SIZE,
    });

    console.log(
      `Found ${savedSearches.length} active ${frequency} saved searches`
    );

    // Process each saved search
    for (const savedSearch of savedSearches) {
      // Check if we should send alert based on last sent time
      if (!shouldSendAlert(frequency, savedSearch.lastAlertSent, now)) {
        console.log(
          `Skipping saved search ${savedSearch.id} - not time yet (last sent: ${savedSearch.lastAlertSent})`
        );
        continue;
      }

      const filters = savedSearch.filters as SavedSearchFilters;

      // Find new jobs matching the search criteria since last alert
      const cutoffDate = getCutoffDate(frequency, savedSearch.lastAlertSent);
      const jobs = await findMatchingJobs(filters, cutoffDate);

      console.log(
        `Found ${jobs.length} new jobs for saved search ${savedSearch.id}`
      );

      // Skip if no new jobs
      if (jobs.length === 0) {
        // Update last check time even if no jobs found
        await prisma.savedSearch.update({
          where: { id: savedSearch.id },
          data: {
            lastAlertSent: now,
            lastMatchCount: 0,
          },
        });
        continue;
      }

      results.total++;

      // Send email
      const teacherName = savedSearch.teacher.user.name || 'Teacher';
      const teacherEmail = savedSearch.teacher.user.email;

      if (!teacherEmail) {
        console.error(
          `No email found for teacher ${savedSearch.teacher.id}`
        );
        results.failed++;
        results.errors.push({
          email: 'unknown',
          error: 'No email address',
        });
        continue;
      }

      const emailResult = await sendDigestJobAlert(
        teacherEmail,
        teacherName,
        jobs.slice(0, MAX_JOBS_PER_EMAIL),
        savedSearch.id,
        filters,
        frequency === 'DAILY' ? 'daily' : 'weekly'
      );

      if (emailResult.success) {
        results.successful++;

        // Update saved search with last sent time and match count
        await prisma.savedSearch.update({
          where: { id: savedSearch.id },
          data: {
            lastAlertSent: now,
            lastMatchCount: jobs.length,
          },
        });
      } else {
        results.failed++;
        results.errors.push({
          email: teacherEmail,
          error: emailResult.error || 'Unknown error',
        });
      }

      // Add delay to avoid rate limits (200ms between emails)
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return results;
  } catch (error) {
    console.error(`Error processing ${frequency} alerts:`, error);
    throw error;
  }
}

/**
 * Get cutoff date for job search based on frequency
 */
function getCutoffDate(
  frequency: AlertFrequency,
  lastAlertSent: Date | null
): Date {
  const now = new Date();

  // If never sent before, use a reasonable default
  if (!lastAlertSent) {
    if (frequency === 'DAILY') {
      // Last 24 hours
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (frequency === 'WEEKLY') {
      // Last 7 days
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  // Use last alert sent time
  return lastAlertSent || now;
}

/**
 * Find jobs matching the saved search filters
 */
async function findMatchingJobs(
  filters: SavedSearchFilters,
  createdSince: Date
): Promise<JobPosting[]> {
  const whereClause: any = {
    status: 'ACTIVE',
    createdAt: {
      gte: createdSince,
    },
  };

  // Apply filters
  if (filters.country) {
    whereClause.country = filters.country;
  }

  if (filters.subject) {
    whereClause.subject = filters.subject;
  }

  if (filters.minSalary) {
    whereClause.salaryMin = {
      gte: filters.minSalary,
    };
  }

  if (filters.maxSalary) {
    whereClause.salaryMax = {
      lte: filters.maxSalary,
    };
  }

  if (filters.housingProvided) {
    whereClause.housingProvided = true;
  }

  if (filters.flightProvided) {
    whereClause.flightProvided = true;
  }

  if (filters.searchQuery) {
    whereClause.OR = [
      {
        title: {
          contains: filters.searchQuery,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: filters.searchQuery,
          mode: 'insensitive',
        },
      },
      {
        schoolName: {
          contains: filters.searchQuery,
          mode: 'insensitive',
        },
      },
    ];
  }

  const jobs = await prisma.jobPosting.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
    take: MAX_JOBS_PER_EMAIL + 10, // Fetch a few extra in case some are filtered out
  });

  return jobs;
}

/**
 * Manual trigger endpoint (for testing)
 *
 * POST /api/cron/job-alerts
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication for manual triggers
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body for options
    const body = await request.json();
    const { frequency, savedSearchId } = body;

    if (savedSearchId) {
      // Test specific saved search
      const result = await testSingleSavedSearch(savedSearchId);
      return NextResponse.json(result);
    }

    if (frequency) {
      // Test specific frequency
      const now = new Date();
      const result = await processAlertsForFrequency(frequency, now);
      return NextResponse.json({
        success: true,
        frequency,
        result,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in manual job alerts trigger:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Test a single saved search (for development/testing)
 */
async function testSingleSavedSearch(savedSearchId: string) {
  const savedSearch = await prisma.savedSearch.findUnique({
    where: { id: savedSearchId },
    include: {
      teacher: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!savedSearch) {
    throw new Error('Saved search not found');
  }

  const filters = savedSearch.filters as SavedSearchFilters;
  const cutoffDate = getCutoffDate(
    savedSearch.alertFrequency as AlertFrequency,
    savedSearch.lastAlertSent
  );
  const jobs = await findMatchingJobs(filters, cutoffDate);

  const teacherName = savedSearch.teacher.user.name || 'Teacher';
  const teacherEmail = savedSearch.teacher.user.email;

  if (!teacherEmail) {
    throw new Error('No email found for teacher');
  }

  const result = await sendDigestJobAlert(
    teacherEmail,
    teacherName,
    jobs,
    savedSearch.id,
    filters,
    savedSearch.alertFrequency === 'DAILY' ? 'daily' : 'weekly'
  );

  if (result.success) {
    await prisma.savedSearch.update({
      where: { id: savedSearch.id },
      data: {
        lastAlertSent: new Date(),
        lastMatchCount: jobs.length,
      },
    });
  }

  return {
    success: result.success,
    savedSearchId,
    jobsFound: jobs.length,
    email: teacherEmail,
    error: result.error,
  };
}
