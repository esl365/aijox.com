/**
 * Job Alerts Email Templates
 *
 * Generates HTML emails for job alerts using Resend API
 *
 * Features:
 * - Beautiful responsive HTML templates
 * - Batch email support
 * - Instant, daily, and weekly digest formats
 * - Unsubscribe/pause links
 * - Privacy-compliant
 */

import { Resend } from 'resend';
import type { JobPosting } from '@prisma/client';
import type { SavedSearchFilters } from '@/lib/types/saved-search';

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

// Constants
const FROM_EMAIL = process.env.FROM_EMAIL || 'jobs@aijobx.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://aijobx.com';
const SUPPORT_EMAIL = 'support@aijobx.com';

/**
 * Email template types
 */
export type EmailTemplate = 'instant' | 'daily' | 'weekly';

/**
 * Send instant job alert (single new job)
 */
export async function sendInstantJobAlert(
  recipientEmail: string,
  recipientName: string,
  job: JobPosting,
  savedSearchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const subject = `New Job Alert: ${job.title} in ${job.country}`;
    const html = generateInstantAlertHTML(recipientName, job, savedSearchId);

    const { data, error } = await getResendClient().emails.send({
      from: `AI Job X <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject,
      html,
    });

    if (error) {
      console.error('Failed to send instant job alert:', error);
      return { success: false, error: error.message };
    }

    console.log('Instant job alert sent:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('Error sending instant job alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send daily/weekly digest (multiple jobs)
 */
export async function sendDigestJobAlert(
  recipientEmail: string,
  recipientName: string,
  jobs: JobPosting[],
  savedSearchId: string,
  filters: SavedSearchFilters,
  frequency: 'daily' | 'weekly'
): Promise<{ success: boolean; error?: string }> {
  try {
    const subject = `Your ${frequency === 'daily' ? 'Daily' : 'Weekly'} Job Alert: ${jobs.length} New ${jobs.length === 1 ? 'Job' : 'Jobs'}`;
    const html = generateDigestAlertHTML(
      recipientName,
      jobs,
      savedSearchId,
      filters,
      frequency
    );

    const { data, error } = await getResendClient().emails.send({
      from: `AI Job X <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject,
      html,
    });

    if (error) {
      console.error('Failed to send digest job alert:', error);
      return { success: false, error: error.message };
    }

    console.log('Digest job alert sent:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('Error sending digest job alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send batch alerts (multiple recipients)
 */
export async function sendBatchJobAlerts(
  alerts: Array<{
    email: string;
    name: string;
    jobs: JobPosting[];
    savedSearchId: string;
    filters: SavedSearchFilters;
    frequency: 'daily' | 'weekly';
  }>
): Promise<{
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const results = {
    total: alerts.length,
    successful: 0,
    failed: 0,
    errors: [] as Array<{ email: string; error: string }>,
  };

  // Send emails sequentially to avoid rate limits
  for (const alert of alerts) {
    const result = await sendDigestJobAlert(
      alert.email,
      alert.name,
      alert.jobs,
      alert.savedSearchId,
      alert.filters,
      alert.frequency
    );

    if (result.success) {
      results.successful++;
    } else {
      results.failed++;
      results.errors.push({
        email: alert.email,
        error: result.error || 'Unknown error',
      });
    }

    // Add small delay to avoid rate limits (100ms)
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Generate HTML for instant alert (single job)
 */
function generateInstantAlertHTML(
  recipientName: string,
  job: JobPosting,
  savedSearchId: string
): string {
  const jobUrl = `${APP_URL}/jobs/${job.id}`;
  const pauseUrl = `${APP_URL}/saved-searches`;
  const unsubscribeUrl = `${APP_URL}/saved-searches`;

  const salary = job.salaryUSD
    ? `$${job.salaryUSD.toLocaleString()} /month`
    : 'Competitive salary';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Job Alert</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      color: #666;
      margin-bottom: 20px;
    }
    .job-card {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 24px;
      margin: 20px 0;
    }
    .job-title {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 12px 0;
    }
    .job-school {
      font-size: 18px;
      color: #4b5563;
      margin: 0 0 16px 0;
    }
    .job-details {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin: 16px 0;
    }
    .detail-badge {
      display: inline-block;
      padding: 6px 12px;
      background-color: #e0e7ff;
      color: #4338ca;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
    }
    .job-description {
      color: #4b5563;
      font-size: 15px;
      line-height: 1.7;
      margin: 16px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-links {
      margin: 15px 0;
    }
    .footer-link {
      color: #6b7280;
      text-decoration: none;
      font-size: 14px;
      margin: 0 10px;
    }
    .footer-text {
      color: #9ca3af;
      font-size: 13px;
      margin: 10px 0;
    }
    @media only screen and (max-width: 600px) {
      .header h1 {
        font-size: 24px;
      }
      .job-title {
        font-size: 20px;
      }
      .content {
        padding: 30px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎯 New Job Alert</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hi ${recipientName},</p>
      <p>A new teaching position matching your saved search has just been posted:</p>

      <!-- Job Card -->
      <div class="job-card">
        <h2 class="job-title">${job.title}</h2>
        <p class="job-school">${job.schoolName}</p>

        <div class="job-details">
          <span class="detail-badge">📍 ${job.country}${job.city ? `, ${job.city}` : ''}</span>
          <span class="detail-badge">💰 ${salary}</span>
          ${job.subject ? `<span class="detail-badge">📚 ${job.subject}</span>` : ''}
          ${job.housingProvided ? '<span class="detail-badge">🏠 Housing</span>' : ''}
          ${job.flightProvided ? '<span class="detail-badge">✈️ Flight</span>' : ''}
        </div>

        ${job.description ? `
        <div class="job-description">
          ${job.description.slice(0, 200)}${job.description.length > 200 ? '...' : ''}
        </div>
        ` : ''}

        <a href="${jobUrl}" class="cta-button">View Full Details →</a>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        💡 <strong>Tip:</strong> Jobs are posted regularly. Set your alert frequency to match your job search pace.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="${pauseUrl}" class="footer-link">Manage Alerts</a>
        <span style="color: #d1d5db;">|</span>
        <a href="${unsubscribeUrl}" class="footer-link">Pause Alerts</a>
        <span style="color: #d1d5db;">|</span>
        <a href="${APP_URL}/jobs" class="footer-link">Browse All Jobs</a>
      </div>
      <p class="footer-text">
        You're receiving this because you created a saved search on AI Job X.<br/>
        <a href="mailto:${SUPPORT_EMAIL}" style="color: #9ca3af;">Contact Support</a>
      </p>
      <p class="footer-text">
        © ${new Date().getFullYear()} AI Job X. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML for digest alert (multiple jobs)
 */
function generateDigestAlertHTML(
  recipientName: string,
  jobs: JobPosting[],
  savedSearchId: string,
  filters: SavedSearchFilters,
  frequency: 'daily' | 'weekly'
): string {
  const searchUrl = `${APP_URL}/saved-searches/${savedSearchId}/results`;
  const pauseUrl = `${APP_URL}/saved-searches`;
  const unsubscribeUrl = `${APP_URL}/saved-searches`;

  // Generate search summary
  const searchCriteria = [];
  if (filters.country) searchCriteria.push(`📍 ${filters.country}`);
  if (filters.subject) searchCriteria.push(`📚 ${filters.subject}`);
  if (filters.minSalary)
    searchCriteria.push(`💰 $${filters.minSalary.toLocaleString()}+`);

  const jobsHTML = jobs
    .slice(0, 10) // Limit to 10 jobs per email
    .map((job) => {
      const jobUrl = `${APP_URL}/jobs/${job.id}`;
      const salary = job.salaryUSD
        ? `$${job.salaryUSD.toLocaleString()}`
        : 'Competitive';

      return `
      <div class="job-item">
        <h3 class="job-item-title">${job.title}</h3>
        <p class="job-item-school">${job.schoolName}</p>
        <div class="job-item-details">
          <span>📍 ${job.country}${job.city ? `, ${job.city}` : ''}</span>
          <span style="color: #d1d5db;">•</span>
          <span>💰 ${salary}</span>
          ${job.subject ? `<span style="color: #d1d5db;">•</span><span>📚 ${job.subject}</span>` : ''}
        </div>
        <a href="${jobUrl}" class="job-item-link">View Details →</a>
      </div>
      `;
    })
    .join('');

  const moreJobs = jobs.length > 10 ? jobs.length - 10 : 0;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${frequency === 'daily' ? 'Daily' : 'Weekly'} Job Alert</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.95;
      font-size: 16px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      color: #666;
      margin-bottom: 20px;
    }
    .search-summary {
      background-color: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .search-summary-title {
      font-weight: 600;
      color: #1e40af;
      margin: 0 0 8px 0;
      font-size: 15px;
    }
    .search-criteria {
      color: #1e3a8a;
      font-size: 14px;
      margin: 0;
    }
    .job-item {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 16px 0;
    }
    .job-item-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 6px 0;
    }
    .job-item-school {
      font-size: 15px;
      color: #6b7280;
      margin: 0 0 10px 0;
    }
    .job-item-details {
      font-size: 14px;
      color: #4b5563;
      margin: 10px 0;
    }
    .job-item-link {
      display: inline-block;
      color: #4f46e5;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      margin-top: 8px;
    }
    .job-item-link:hover {
      text-decoration: underline;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .more-jobs {
      text-align: center;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-links {
      margin: 15px 0;
    }
    .footer-link {
      color: #6b7280;
      text-decoration: none;
      font-size: 14px;
      margin: 0 10px;
    }
    .footer-text {
      color: #9ca3af;
      font-size: 13px;
      margin: 10px 0;
    }
    @media only screen and (max-width: 600px) {
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 30px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>📬 ${frequency === 'daily' ? 'Daily' : 'Weekly'} Job Alert</h1>
      <p>${jobs.length} new ${jobs.length === 1 ? 'job' : 'jobs'} matching your search</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hi ${recipientName},</p>

      ${
        searchCriteria.length > 0
          ? `
      <div class="search-summary">
        <p class="search-summary-title">Your Search Criteria:</p>
        <p class="search-criteria">${searchCriteria.join(' • ')}</p>
      </div>
      `
          : ''
      }

      <p>Here ${jobs.length === 1 ? 'is a new teaching position' : `are ${jobs.length} new teaching positions`} that ${jobs.length === 1 ? 'matches' : 'match'} your saved search:</p>

      <!-- Job Items -->
      ${jobsHTML}

      ${
        moreJobs > 0
          ? `
      <div class="more-jobs">
        <p style="color: #4b5563; margin: 0 0 12px 0;">
          <strong>+${moreJobs} more ${moreJobs === 1 ? 'job' : 'jobs'}</strong>
        </p>
        <a href="${searchUrl}" class="cta-button">View All ${jobs.length} Jobs →</a>
      </div>
      `
          : `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${searchUrl}" class="cta-button">View All Results →</a>
      </div>
      `
      }

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        💡 <strong>Tip:</strong> Apply early! Jobs posted recently tend to get the most responses.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="${pauseUrl}" class="footer-link">Manage Alerts</a>
        <span style="color: #d1d5db;">|</span>
        <a href="${unsubscribeUrl}" class="footer-link">Pause Alerts</a>
        <span style="color: #d1d5db;">|</span>
        <a href="${APP_URL}/jobs" class="footer-link">Browse All Jobs</a>
      </div>
      <p class="footer-text">
        You're receiving this ${frequency} because of your saved search on AI Job X.<br/>
        <a href="mailto:${SUPPORT_EMAIL}" style="color: #9ca3af;">Contact Support</a>
      </p>
      <p class="footer-text">
        © ${new Date().getFullYear()} AI Job X. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send test email (for development/testing)
 */
export async function sendTestJobAlert(
  recipientEmail: string
): Promise<{ success: boolean; error?: string }> {
  const mockJob: JobPosting = {
    id: 'test-job-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    schoolId: 'test-school',
    recruiterId: null,
    title: 'ESL Teacher - Elementary',
    schoolName: 'Seoul International Academy',
    country: 'South Korea',
    city: 'Seoul',
    subject: 'English as a Second Language',
    description:
      'Join our vibrant international school in the heart of Seoul. We are seeking an enthusiastic ESL teacher to join our elementary team.',
    minYearsExperience: 2,
    requiredSubjects: ['English as a Second Language'],
    requirements: '2+ years teaching experience preferred',
    salaryUSD: 3000,
    currency: 'USD',
    benefits: 'Housing and flight allowance provided',
    housingProvided: true,
    flightProvided: true,
    contractLength: 12,
    startDate: new Date('2025-08-01'),
    isAnonymous: false,
    hiddenOrgName: null,
    status: 'ACTIVE',
    matchNotificationsSent: 0,
    lastMatchedAt: null,
    // Google for Jobs fields
    expiresAt: null,
    employmentType: 'FULL_TIME',
    educationRequirements: "Bachelor's degree in Education or related field",
    experienceRequirements: '2+ years teaching experience preferred',
    applicationUrl: null,
  };

  return sendInstantJobAlert(
    recipientEmail,
    'Test User',
    mockJob,
    'test-search-id'
  );
}
