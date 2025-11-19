/**
 * Type definitions for Google for Jobs structured data
 * @see https://developers.google.com/search/docs/appearance/structured-data/job-posting
 */

/**
 * Valid employment types for Google for Jobs
 */
export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACTOR',
  TEMPORARY: 'TEMPORARY',
  INTERN: 'INTERN',
  VOLUNTEER: 'VOLUNTEER',
  PER_DIEM: 'PER_DIEM',
  OTHER: 'OTHER',
} as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[keyof typeof EMPLOYMENT_TYPES];

/**
 * Google for Jobs JobPosting Schema.org structure
 */
export interface GoogleJobPosting {
  '@context': 'https://schema.org';
  '@type': 'JobPosting';
  title: string;
  description: string;
  identifier?: {
    '@type': 'PropertyValue';
    name: string;
    value: string;
  };
  datePosted: string; // ISO 8601 format
  validThrough?: string; // ISO 8601 format
  employmentType?: EmploymentType | EmploymentType[];
  hiringOrganization: {
    '@type': 'Organization';
    name: string;
    sameAs?: string; // Organization website
    logo?: string;
  };
  jobLocation: {
    '@type': 'Place';
    address: {
      '@type': 'PostalAddress';
      streetAddress?: string;
      addressLocality: string; // City
      addressRegion?: string; // State/Province
      addressCountry: string; // ISO 3166-1 alpha-2 country code
    };
  };
  baseSalary?: {
    '@type': 'MonetaryAmount';
    currency: string; // ISO 4217 currency code
    value: {
      '@type': 'QuantitativeValue';
      value: number;
      minValue?: number;
      maxValue?: number;
      unitText: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    };
  };
  // Optional but recommended
  educationRequirements?: {
    '@type': 'EducationalOccupationalCredential';
    credentialCategory: string;
  } | string;
  experienceRequirements?: {
    '@type': 'OccupationalExperienceRequirements';
    monthsOfExperience?: number;
  } | string;
  responsibilities?: string;
  skills?: string | string[];
  qualifications?: string | string[];
  benefits?: string | string[];
  directApply?: boolean;
  applicationContact?: {
    '@type': 'ContactPoint';
    telephone?: string;
    email?: string;
  };
}

/**
 * Validate if date is in valid ISO 8601 format for Google
 */
export function isValidGoogleJobDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
}

/**
 * Format date to ISO 8601 string for Google
 */
export function formatGoogleJobDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Calculate default expiration date (30 days from now)
 */
export function getDefaultExpirationDate(startDate: Date = new Date()): Date {
  const expirationDate = new Date(startDate);
  expirationDate.setDate(expirationDate.getDate() + 30);
  return expirationDate;
}

/**
 * Validate Google for Jobs schema
 */
export function validateGoogleJobSchema(schema: GoogleJobPosting): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!schema.title || schema.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!schema.description || schema.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!schema.datePosted || !isValidGoogleJobDate(schema.datePosted)) {
    errors.push('Valid datePosted is required');
  }

  // Recommended: validThrough should be in the future
  if (schema.validThrough) {
    const expirationDate = new Date(schema.validThrough);
    const now = new Date();
    if (expirationDate < now) {
      errors.push('validThrough should be in the future');
    }
  }

  // Validate organization
  if (!schema.hiringOrganization?.name) {
    errors.push('Hiring organization name is required');
  }

  // Validate location
  if (!schema.jobLocation?.address?.addressLocality) {
    errors.push('Job location city (addressLocality) is required');
  }

  if (!schema.jobLocation?.address?.addressCountry) {
    errors.push('Job location country (addressCountry) is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Map database country names to ISO 3166-1 alpha-2 codes
 */
export const COUNTRY_CODES: Record<string, string> = {
  'South Korea': 'KR',
  'Korea': 'KR',
  'China': 'CN',
  'UAE': 'AE',
  'United Arab Emirates': 'AE',
  'Vietnam': 'VN',
  'Thailand': 'TH',
  'Japan': 'JP',
  'Saudi Arabia': 'SA',
  'Taiwan': 'TW',
  'Singapore': 'SG',
  'Qatar': 'QA',
} as const;

/**
 * Get ISO country code from country name
 */
export function getCountryCode(countryName: string): string {
  return COUNTRY_CODES[countryName] || countryName;
}
