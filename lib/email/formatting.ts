/**
 * Email Formatting Utilities
 *
 * Refinement.md:351-366 - Consolidate duplicated email formatting logic
 */

import type { JobPosting } from '@prisma/client';

/**
 * Format job outreach email as HTML
 *
 * Consolidates email HTML formatting from:
 * - lib/ai/email-generator.ts:131-165 (fallback template)
 * - app/actions/match-teachers.ts:285-329 (HTML wrapper)
 */
export function formatJobEmailHTML(params: {
  teacherFirstName: string;
  emailBody: string;
  jobTitle: string;
  schoolName: string;
  city: string;
  country: string;
  salaryUSD: number;
  jobUrl?: string;
  matchPercentage?: number;
}): string {
  const {
    teacherFirstName,
    emailBody,
    jobTitle,
    schoolName,
    city,
    country,
    salaryUSD,
    jobUrl,
    matchPercentage
  } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Job Opportunity</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .job-title {
      color: #2563eb;
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 10px 0;
    }
    .school-info {
      color: #666;
      font-size: 16px;
    }
    .match-badge {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      margin: 10px 0;
    }
    .email-body {
      margin: 20px 0;
      white-space: pre-wrap;
    }
    .job-details {
      background-color: #f8fafc;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
    }
    .detail-label {
      font-weight: 600;
      color: #475569;
    }
    .detail-value {
      color: #1e293b;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1 class="job-title">${jobTitle}</h1>
      <p class="school-info">${schoolName} • ${city}, ${country}</p>
      ${matchPercentage ? `<span class="match-badge">${matchPercentage}% Match</span>` : ''}
    </div>

    <div class="email-body">
      <p>Hi ${teacherFirstName},</p>
      ${emailBody}
    </div>

    <div class="job-details">
      <div class="detail-row">
        <span class="detail-label">Position:</span>
        <span class="detail-value">${jobTitle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">School:</span>
        <span class="detail-value">${schoolName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Location:</span>
        <span class="detail-value">${city}, ${country}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Salary:</span>
        <span class="detail-value">$${salaryUSD.toLocaleString()}/month</span>
      </div>
    </div>

    ${jobUrl ? `
    <center>
      <a href="${jobUrl}" class="cta-button">View Full Job Details</a>
    </center>
    ` : ''}

    <div class="footer">
      <p>This personalized job match was sent by Global Educator Nexus AI.</p>
      <p>If you're not interested in this position, you can update your job preferences in your dashboard.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of email (for accessibility and spam filters)
 */
export function formatJobEmailPlainText(params: {
  teacherFirstName: string;
  emailBody: string;
  jobTitle: string;
  schoolName: string;
  city: string;
  country: string;
  salaryUSD: number;
  jobUrl?: string;
  matchPercentage?: number;
}): string {
  const {
    teacherFirstName,
    emailBody,
    jobTitle,
    schoolName,
    city,
    country,
    salaryUSD,
    jobUrl,
    matchPercentage
  } = params;

  return `
${matchPercentage ? `⭐ ${matchPercentage}% MATCH\n\n` : ''}${jobTitle}
${schoolName} • ${city}, ${country}

Hi ${teacherFirstName},

${emailBody}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JOB DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Position: ${jobTitle}
School: ${schoolName}
Location: ${city}, ${country}
Salary: $${salaryUSD.toLocaleString()}/month

${jobUrl ? `View Full Details: ${jobUrl}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This personalized job match was sent by Global Educator Nexus AI.
If you're not interested, update your preferences in your dashboard.
  `.trim();
}

/**
 * Fallback email template when AI generation fails
 */
export function generateFallbackEmail(params: {
  teacherFirstName: string;
  jobTitle: string;
  schoolName: string;
  city: string;
  country: string;
  subjects?: string[];
  yearsExperience?: number;
  matchReasons?: string[];
}): string {
  const { teacherFirstName, jobTitle, schoolName, city, country, subjects, yearsExperience, matchReasons } = params;

  let body = `We found an exciting teaching opportunity that matches your profile!\n\n`;
  body += `${schoolName} in ${city}, ${country} is looking for a ${jobTitle}.\n\n`;

  if (matchReasons && matchReasons.length > 0) {
    body += `Why you're a great fit:\n`;
    matchReasons.slice(0, 3).forEach(reason => {
      body += `• ${reason}\n`;
    });
    body += `\n`;
  }

  if (subjects && subjects.length > 0) {
    body += `This position aligns with your expertise in ${subjects.slice(0, 2).join(' and ')}.\n\n`;
  }

  if (yearsExperience && yearsExperience > 0) {
    body += `With your ${yearsExperience} years of teaching experience, you'd be an excellent candidate.\n\n`;
  }

  body += `Click below to learn more about this opportunity and apply today!`;

  return body;
}

/**
 * Format email subject line with emoji and personalization
 */
export function formatEmailSubject(params: {
  teacherFirstName: string;
  jobTitle: string;
  location: string;
  matchPercentage?: number;
  templateIndex?: number;
}): string {
  const { teacherFirstName, jobTitle, location, matchPercentage, templateIndex = 0 } = params;

  const templates = [
    `🌟 ${teacherFirstName}, Perfect Match: ${jobTitle} in ${location}`,
    `📚 ${teacherFirstName}, ${jobTitle} Position - ${matchPercentage}% Match!`,
    `✨ Opportunity Alert: ${jobTitle} in ${location}`,
    `🎯 ${teacherFirstName}, We Found Your Next Teaching Role!`
  ];

  return templates[templateIndex % templates.length];
}
