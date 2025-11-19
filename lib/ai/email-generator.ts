/**
 * AI Agent 2: Autonomous Headhunter - Email Generation
 *
 * Generates personalized outreach emails using Claude 3.5 Sonnet
 */

import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { FilteredCandidate } from '@/lib/matching/filter-candidates';
import type { JobPosting } from '@prisma/client';
import { trackAICost } from '@/lib/ai/cost-tracker';

export type EmailContent = {
  subject: string;
  body: string;
  preview: string;
};

/**
 * Generate personalized outreach email for a job match
 */
export async function generateOutreachEmail(
  teacher: {
    firstName: string;
    lastName: string;
    subjects: string[];
    yearsExperience: number;
    currentCountry?: string;
    preferredCountries: string[];
    minSalaryUSD?: number;
  },
  job: {
    title: string;
    schoolName: string;
    isAnonymous: boolean;
    city: string;
    country: string;
    salaryUSD: number;
    benefits?: string;
    startDate?: Date;
  },
  matchReasons: string[],
  similarity: number,
  userId?: string
): Promise<EmailContent> {
  const matchPercentage = Math.round(similarity * 100);

  const prompt = `You are a professional international school recruiter writing a personalized email to ${teacher.firstName} ${teacher.lastName}.

CONTEXT:
- This teacher is a ${matchPercentage}% match for the position
- They have ${teacher.yearsExperience} years of experience teaching ${teacher.subjects.join(', ')}
- Currently in: ${teacher.currentCountry || 'Not specified'}
- Interested in: ${teacher.preferredCountries.join(', ')}
- Minimum salary expectation: $${teacher.minSalaryUSD || 'Not specified'}/month

JOB DETAILS:
- Position: ${job.title}
- School: ${job.isAnonymous ? 'A prestigious international school' : job.schoolName}
- Location: ${job.city}, ${job.country}
- Salary: $${job.salaryUSD}/month
- Benefits: ${job.benefits || 'Comprehensive benefits package'}
- Start Date: ${job.startDate ? job.startDate.toLocaleDateString() : 'Flexible'}

WHY THEY MATCH (top reasons):
${matchReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

WRITING GUIDELINES:
1. Be warm and conversational, not corporate
2. Address their specific interests and career goals
3. Highlight concrete benefits relevant to them (location, salary, growth)
4. Create subtle urgency (positions fill quickly) without being pushy
5. Include clear next step: "Click here to view full details and apply"
6. Keep it under 150 words total
7. Use "you" language, not "we" language
8. NO generic phrases like "great opportunity" or "exciting position"
9. Focus on WIIFM (What's In It For Me)

TONE: Professional but friendly. Like a recruiter who genuinely knows this is a good fit.

OUTPUT FORMAT:
Return ONLY the email body text. Do not include subject line or greetings (we'll add those).`;

  try {
    const result = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt,
      temperature: 0.7, // Some creativity for personalization
      maxTokens: 400,
    });

    // Track AI cost (Phase 5-3.2)
    if (userId && result.usage) {
      await trackAICost({
        userId,
        operation: 'email-generation',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        inputTokens: result.usage.promptTokens,
        outputTokens: result.usage.completionTokens,
        metadata: {
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          jobTitle: job.title,
          matchPercentage,
        },
      });
    }

    // Generate subject line
    const subject = generateSubjectLine(teacher.firstName, job, matchPercentage);

    // Generate preview text (first line)
    const preview = result.text.split('\n')[0].slice(0, 100);

    return {
      subject,
      body: result.text.trim(),
      preview
    };

  } catch (error: any) {
    console.error('Email generation failed:', error);

    // Fallback to template-based email
    return generateFallbackEmail(teacher, job, matchReasons, matchPercentage);
  }
}

/**
 * Generate attention-grabbing subject line
 */
function generateSubjectLine(
  firstName: string,
  job: { title: string; city: string; country: string },
  matchPercentage: number
): string {
  const templates = [
    `${firstName}, you're a ${matchPercentage}% match for this ${job.city} position`,
    `${job.title} in ${job.city} - Perfect for your background`,
    `${firstName}: ${job.title} opportunity in ${job.country}`,
    `New ${job.title} role matches your profile (${matchPercentage}%)`,
  ];

  // Rotate through templates based on hash of firstName
  const index = firstName.charCodeAt(0) % templates.length;
  return templates[index];
}

/**
 * Fallback template-based email (if AI fails)
 */
function generateFallbackEmail(
  teacher: any,
  job: any,
  matchReasons: string[],
  matchPercentage: number
): EmailContent {
  const salaryDelta = teacher.minSalaryUSD
    ? job.salaryUSD - teacher.minSalaryUSD
    : null;

  const body = `Hi ${teacher.firstName},

I found a ${job.title} position in ${job.city}, ${job.country} that matches your profile at ${matchPercentage}%.

Here's why I think this is a strong fit:
${matchReasons.map(r => `• ${r}`).join('\n')}

${salaryDelta && salaryDelta > 0 ? `The salary ($${job.salaryUSD}/mo) is $${salaryDelta} above your stated minimum.` : ''}

${teacher.preferredCountries.includes(job.country) ? `Since you're interested in ${job.country}, this could be exactly what you're looking for.` : ''}

Positions like this typically receive 50+ applications and fill within 2 weeks. I'd recommend reviewing the details soon.

View full job description and apply: [LINK]

Best,
Global Educator Nexus Team`;

  return {
    subject: generateSubjectLine(teacher.firstName, job, matchPercentage),
    body: body.trim(),
    preview: `${matchPercentage}% match: ${job.title} in ${job.city}`
  };
}

/**
 * Batch email generation (more efficient for multiple candidates)
 */
export async function generateBatchEmails(
  matches: Array<{
    teacher: Parameters<typeof generateOutreachEmail>[0];
    job: Parameters<typeof generateOutreachEmail>[1];
    matchReasons: string[];
    similarity: number;
  }>
): Promise<EmailContent[]> {
  // Process in parallel batches to respect rate limits
  const BATCH_SIZE = 5;
  const results: EmailContent[] = [];

  for (let i = 0; i < matches.length; i += BATCH_SIZE) {
    const batch = matches.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(m => generateOutreachEmail(m.teacher, m.job, m.matchReasons, m.similarity))
    );

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Email generation failed:', result.reason);
        // Use fallback
        const match = batch[j];
        results.push(generateFallbackEmail(
          match.teacher,
          match.job,
          match.matchReasons,
          Math.round(match.similarity * 100)
        ));
      }
    }

    // Rate limiting delay
    if (i + BATCH_SIZE < matches.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Generate digest email (for non-urgent job notifications)
 */
export async function generateDigestEmail(
  teacher: { firstName: string },
  jobs: Array<{ title: string; city: string; country: string; matchPercentage: number }>
): Promise<EmailContent> {
  const jobList = jobs
    .map((j, i) => `${i + 1}. ${j.title} in ${j.city}, ${j.country} (${j.matchPercentage}% match)`)
    .join('\n');

  const body = `Hi ${teacher.firstName},

We found ${jobs.length} new teaching positions that match your profile:

${jobList}

These positions align with your experience and location preferences. Click below to review full details and apply to the ones that interest you.

[View All Matches]

New positions are added daily. Keep your profile updated to receive the best matches.

Best,
Global Educator Nexus`;

  return {
    subject: `${teacher.firstName}, ${jobs.length} new positions match your profile`,
    body,
    preview: `${jobs.length} new teaching positions`
  };
}
