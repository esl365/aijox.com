/**
 * Google for Jobs Schema Generator
 *
 * Generates structured data markup for Google for Jobs integration
 * @see https://developers.google.com/search/docs/appearance/structured-data/job-posting
 */

import type { JobPosting } from '@prisma/client';
import type { GoogleJobPosting, EmploymentType } from '@/lib/types/google-jobs';
import {
  formatGoogleJobDate,
  getDefaultExpirationDate,
  validateGoogleJobSchema,
  getCountryCode,
  EMPLOYMENT_TYPES,
} from '@/lib/types/google-jobs';

/**
 * Generate Google for Jobs structured data from JobPosting
 */
export function generateGoogleJobSchema(
  job: JobPosting,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://aijobx.com'
): GoogleJobPosting {
  // Calculate expiration date (use job.expiresAt or default to 30 days)
  const expirationDate = job.expiresAt || getDefaultExpirationDate(job.createdAt);

  // Map employment type to Google's expected values
  const employmentType = (job.employmentType || 'FULL_TIME') as EmploymentType;

  // Build the schema
  const schema: GoogleJobPosting = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',

    // Basic Information (Required)
    title: job.title,
    description: job.description,

    // Unique identifier (Recommended)
    identifier: {
      '@type': 'PropertyValue',
      name: 'Job ID',
      value: job.id,
    },

    // Dates (Required)
    datePosted: formatGoogleJobDate(job.createdAt),
    validThrough: formatGoogleJobDate(expirationDate),

    // Employment type (Recommended)
    employmentType: employmentType,

    // Hiring Organization (Required)
    hiringOrganization: {
      '@type': 'Organization',
      name: job.schoolName,
    },

    // Location (Required)
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.city,
        addressCountry: getCountryCode(job.country),
      },
    },

    // Salary (Recommended)
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: job.currency || 'USD',
      value: {
        '@type': 'QuantitativeValue',
        value: job.salaryUSD,
        unitText: 'MONTH',
      },
    },
  };

  // Add optional fields if available

  // Education requirements
  if (job.educationRequirements) {
    schema.educationRequirements = job.educationRequirements;
  }

  // Experience requirements
  if (job.experienceRequirements) {
    schema.experienceRequirements = job.experienceRequirements;
  } else if (job.minYearsExperience) {
    // Fallback: Create from minYearsExperience
    schema.experienceRequirements = {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: job.minYearsExperience * 12,
    };
  }

  // Responsibilities (from requirements field)
  if (job.requirements) {
    schema.responsibilities = job.requirements;
  }

  // Skills (from requiredSubjects)
  if (job.requiredSubjects && job.requiredSubjects.length > 0) {
    schema.skills = job.requiredSubjects;
  }

  // Benefits
  if (job.benefits) {
    const benefitsList: string[] = [job.benefits];

    if (job.housingProvided) {
      benefitsList.push('Housing provided');
    }

    if (job.flightProvided) {
      benefitsList.push('Flight tickets provided');
    }

    schema.benefits = benefitsList;
  } else {
    // Build benefits from boolean flags
    const benefitsList: string[] = [];

    if (job.housingProvided) {
      benefitsList.push('Housing provided');
    }

    if (job.flightProvided) {
      benefitsList.push('Flight tickets provided');
    }

    if (benefitsList.length > 0) {
      schema.benefits = benefitsList;
    }
  }

  // Application URL
  schema.directApply = true;

  // Use custom application URL if provided, otherwise use platform URL
  const applicationUrl = job.applicationUrl || `${baseUrl}/jobs/${job.id}/apply`;

  return schema;
}

/**
 * Generate JSON-LD script tag content for embedding in HTML
 */
export function generateGoogleJobSchemaScript(job: JobPosting): string {
  const schema = generateGoogleJobSchema(job);

  // Validate schema before generating
  const validation = validateGoogleJobSchema(schema);

  if (!validation.isValid) {
    console.error('[Google Jobs Schema] Validation errors:', validation.errors);
    // In development, throw error. In production, log warning.
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Invalid Google Jobs Schema: ${validation.errors.join(', ')}`);
    }
  }

  return JSON.stringify(schema, null, 2);
}

/**
 * Helper: Check if job is eligible for Google for Jobs
 */
export function isEligibleForGoogleJobs(job: JobPosting): boolean {
  // Job must be active
  if (job.status !== 'ACTIVE') {
    return false;
  }

  // Must have required fields
  if (!job.title || !job.description || !job.city || !job.country) {
    return false;
  }

  // Must have valid expiration date (not expired)
  const expirationDate = job.expiresAt || getDefaultExpirationDate(job.createdAt);
  if (expirationDate < new Date()) {
    return false;
  }

  return true;
}

/**
 * Generate Open Graph metadata for job posting
 */
export function generateJobOpenGraphMetadata(job: JobPosting) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aijobx.com';

  return {
    title: `${job.title} - ${job.schoolName}`,
    description: `${job.description.slice(0, 160)}...`,
    url: `${baseUrl}/jobs/${job.id}`,
    siteName: 'Global Educator Nexus',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og-job-posting.jpg`, // Generic job posting OG image
        width: 1200,
        height: 630,
        alt: `${job.title} at ${job.schoolName}`,
      },
    ],
  };
}

/**
 * Generate Twitter Card metadata for job posting
 */
export function generateJobTwitterMetadata(job: JobPosting) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aijobx.com';

  const benefitsText = [
    job.housingProvided ? '🏠 Housing' : null,
    job.flightProvided ? '✈️ Flight' : null,
  ]
    .filter(Boolean)
    .join(' • ');

  const description = `${job.city}, ${job.country} • $${job.salaryUSD.toLocaleString()}/month${benefitsText ? ' • ' + benefitsText : ''}`;

  return {
    card: 'summary_large_image',
    title: job.title,
    description,
    creator: '@GlobalEdNexus',
    images: [`${baseUrl}/twitter-job-posting.jpg`],
  };
}
