/**
 * Server Actions for Agent 2: Autonomous Headhunter
 *
 * Orchestrates the complete matching and notification pipeline
 */

'use server';

import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { findMatchingTeachers } from '@/lib/db/vector-search';
import { applyFilters, deduplicateMatches } from '@/lib/matching/filter-candidates';
import { generateBatchEmails } from '@/lib/ai/email-generator';
import { jobMatchingRateLimit, checkRateLimit } from '@/lib/rate-limit';
import { SCORING_CONFIG } from '@/lib/config/scoring';

// Lazy initialize Resend client only when needed
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export type MatchingResult = {
  success: boolean;
  message: string;
  stats?: {
    totalMatches: number;
    afterFiltering: number;
    emailsSent: number;
    failed: number;
  };
  error?: string;
};

/**
 * Main entry point: Find and notify matching teachers for a new job
 * Triggered automatically when a job is posted
 *
 * Rate Limiting: 20 requests per hour per recruiter (Refinement.md:416)
 */
export async function notifyMatchedTeachers(
  jobId: string,
  options: {
    minSimilarity?: number;
    maxCandidates?: number;
    sendImmediately?: boolean;
  } = {}
): Promise<MatchingResult> {
  try {
    // 0. Check authentication and rate limit
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
        message: 'Please sign in to continue.'
      };
    }

    // Rate limiting: 20 requests per hour per recruiter
    const rateLimitResult = await checkRateLimit(
      jobMatchingRateLimit,
      session.user.id,
      'job-matching'
    );

    if (!rateLimitResult.success) {
      return {
        success: false,
        error: 'Rate limited',
        message: rateLimitResult.error || 'Rate limit exceeded'
      };
    }

    const {
      minSimilarity = SCORING_CONFIG.MATCHING.DEFAULT_MIN_SIMILARITY,
      maxCandidates = SCORING_CONFIG.MATCHING.DEFAULT_MAX_CANDIDATES,
      sendImmediately = true
    } = options;

    // 1. Fetch job details
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { school: true }
    });

    if (!job) {
      return {
        success: false,
        error: 'Job not found',
        message: 'Job posting does not exist'
      };
    }

    /* TODO: Enable when embedding field is available
    if (!job.embedding) {
      return {
        success: false,
        error: 'No embedding',
        message: 'Job embedding not generated. Please save the job again.'
      };
    }
    */

    // 2. Find matching teachers (using basic filtering when embeddings unavailable)
    console.log(`Finding matches for job ${jobId}...`);
    // TODO: Replace with vector search when embedding is available
    const rawMatches: any[] = []; // await findMatchingTeachers(jobId, minSimilarity, maxCandidates);

    if (rawMatches.length === 0) {
      return {
        success: true,
        message: 'No qualified matches found',
        stats: {
          totalMatches: 0,
          afterFiltering: 0,
          emailsSent: 0,
          failed: 0
        }
      };
    }

    // 3. Apply multi-stage filters
    console.log(`Filtering ${rawMatches.length} candidates...`);
    const { filtered, stats } = applyFilters(rawMatches, job);

    console.log('Filter stats:', stats);

    if (filtered.length === 0) {
      return {
        success: true,
        message: 'All candidates filtered out (visa/requirements)',
        stats: {
          totalMatches: rawMatches.length,
          afterFiltering: 0,
          emailsSent: 0,
          failed: 0
        }
      };
    }

    // 4. Deduplicate (remove recently contacted teachers)
    const deduplicated = await deduplicateMatches(filtered, jobId, prisma);

    console.log(`After deduplication: ${deduplicated.length} candidates`);

    if (deduplicated.length === 0) {
      return {
        success: true,
        message: 'All candidates already contacted recently',
        stats: {
          totalMatches: rawMatches.length,
          afterFiltering: filtered.length,
          emailsSent: 0,
          failed: 0
        }
      };
    }

    // 5. Generate personalized emails
    console.log('Generating personalized emails...');
    const emailData = deduplicated.map(candidate => ({
      teacher: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        subjects: candidate.subjects,
        yearsExperience: candidate.yearsExperience,
        preferredCountries: candidate.preferredCountries,
        minSalaryUSD: candidate.minSalaryUSD
      },
      job: {
        title: job.title,
        schoolName: job.schoolName,
        isAnonymous: job.isAnonymous,
        city: job.city,
        country: job.country,
        salaryUSD: job.salaryUSD,
        benefits: job.benefits ?? undefined,
        startDate: job.startDate ?? undefined
      },
      matchReasons: candidate.matchReasons,
      similarity: candidate.similarity
    }));

    const emailContents = await generateBatchEmails(emailData);

    // 6. Send emails (if immediate mode)
    let emailsSent = 0;
    let failed = 0;

    if (sendImmediately) {
      console.log(`Sending ${emailContents.length} emails...`);

      // Prepare email batches (Resend supports batch sending)
      const emailBatches = deduplicated.map((candidate, i) => ({
        from: 'jobs@globaleducatornexus.com',
        to: candidate.email,
        subject: emailContents[i].subject,
        html: formatEmailHTML(emailContents[i].body, job, candidate),
        tags: [
          { name: 'job_id', value: jobId },
          { name: 'match_quality', value: candidate.matchQuality },
          { name: 'similarity', value: Math.round(candidate.similarity * 100).toString() }
        ]
      }));

      // Send in batches of 50 (Resend limit)
      const BATCH_SIZE = 50;

      for (let i = 0; i < emailBatches.length; i += BATCH_SIZE) {
        const batch = emailBatches.slice(i, i + BATCH_SIZE);

        try {
          await getResendClient().batch.send(batch);
          emailsSent += batch.length;

          // Rate limiting delay
          if (i + BATCH_SIZE < emailBatches.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error('Batch email send failed:', error);
          failed += batch.length;
        }
      }
    }

    // 7. Log notifications to database
    await prisma.matchNotification.createMany({
      data: deduplicated.map(candidate => ({
        jobId,
        teacherId: candidate.id,
        matchScore: candidate.similarity,
        matchQuality: candidate.matchQuality,
        sentAt: sendImmediately ? new Date() : null,
        status: sendImmediately ? 'SENT' : 'QUEUED'
      }))
    });

    // 8. Update job statistics
    await prisma.jobPosting.update({
      where: { id: jobId },
      data: {
        matchNotificationsSent: deduplicated.length,
        lastMatchedAt: new Date()
      }
    });

    revalidatePath(`/jobs/${jobId}`);

    return {
      success: true,
      message: `Successfully notified ${emailsSent} qualified teachers`,
      stats: {
        totalMatches: rawMatches.length,
        afterFiltering: filtered.length,
        emailsSent,
        failed
      }
    };

  } catch (error: any) {
    console.error('Matching pipeline failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to process job matches'
    };
  }
}

/**
 * Preview matches before sending (for recruiter review)
 */
export async function previewJobMatches(jobId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const rawMatches = await findMatchingTeachers(jobId, 0.80, 30);

  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId }
  });

  if (!job) throw new Error('Job not found');

  const { filtered, stats } = applyFilters(rawMatches, job);

  return {
    matches: filtered.slice(0, 10), // Top 10 preview
    stats,
    total: filtered.length
  };
}

/**
 * Manual trigger for re-matching (if job is updated)
 */
export async function rematchJob(jobId: string): Promise<MatchingResult> {
  const session = await auth();

  if (!session?.user || (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN')) {
    return {
      success: false,
      error: 'Unauthorized',
      message: 'Only recruiters can trigger re-matching'
    };
  }

  return notifyMatchedTeachers(jobId, { sendImmediately: false });
}

/**
 * Format email HTML (with proper styling and CTA)
 */
function formatEmailHTML(
  body: string,
  job: any,
  candidate: any
): string {
  const jobUrl = `${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.id}?ref=email&teacher=${candidate.id}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Global Educator Nexus</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    ${body.split('\n').map(p => `<p style="margin-bottom: 16px;">${p}</p>`).join('')}

    <div style="text-align: center; margin: 30px 0;">
      <a href="${jobUrl}" style="display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        View Full Details & Apply
      </a>
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
        <strong>Position:</strong> ${job.title}<br>
        <strong>Location:</strong> ${job.city}, ${job.country}<br>
        <strong>Salary:</strong> $${job.salaryUSD}/month
      </p>

      <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
        This email was sent because your profile matches this position.
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications" style="color: #667eea;">Manage notifications</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Utility: Sleep function
 */
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
