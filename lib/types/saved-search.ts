/**
 * Type definitions for Saved Searches & Job Alerts
 */

import type { JobFilters } from '@/app/actions/jobs';

/**
 * Alert frequency options
 */
export const ALERT_FREQUENCIES = {
  INSTANT: 'INSTANT', // Send immediately when new matching job is posted
  DAILY: 'DAILY',     // Send daily digest at 9 AM user's timezone
  WEEKLY: 'WEEKLY',   // Send weekly digest on Mondays
  NEVER: 'NEVER',     // Don't send alerts (just save the search)
} as const;

export type AlertFrequency = (typeof ALERT_FREQUENCIES)[keyof typeof ALERT_FREQUENCIES];

/**
 * Saved search filters (extends JobFilters)
 */
export type SavedSearchFilters = JobFilters & {
  // Additional filters specific to saved searches
  keywords?: string[];
  excludeSchools?: string[]; // School names to exclude
  remoteOnly?: boolean;
};

/**
 * Saved search creation input
 */
export type CreateSavedSearchInput = {
  name?: string;
  filters: SavedSearchFilters;
  alertEmail?: boolean;
  alertFrequency?: AlertFrequency;
};

/**
 * Saved search update input
 */
export type UpdateSavedSearchInput = {
  name?: string;
  filters?: SavedSearchFilters;
  alertEmail?: boolean;
  alertFrequency?: AlertFrequency;
  isActive?: boolean;
};

/**
 * Job alert email data
 */
export type JobAlertEmailData = {
  teacherName: string;
  teacherEmail: string;
  searchName: string;
  jobs: Array<{
    id: string;
    title: string;
    schoolName: string;
    city: string;
    country: string;
    salaryUSD: number;
    housingProvided: boolean;
    flightProvided: boolean;
    subject: string;
    matchScore?: number; // If AI matching is available
  }>;
  searchUrl: string; // URL to view all matching jobs
  unsubscribeUrl: string; // URL to disable this alert
};

/**
 * Alert send status
 */
export type AlertSendResult = {
  savedSearchId: string;
  success: boolean;
  jobsFound: number;
  emailSent: boolean;
  error?: string;
};

/**
 * Validate alert frequency
 */
export function isValidAlertFrequency(frequency: string): frequency is AlertFrequency {
  return Object.values(ALERT_FREQUENCIES).includes(frequency as AlertFrequency);
}

/**
 * Get human-readable alert frequency label
 */
export function getAlertFrequencyLabel(frequency: AlertFrequency): string {
  const labels: Record<AlertFrequency, string> = {
    INSTANT: 'Instant (as posted)',
    DAILY: 'Daily (9 AM)',
    WEEKLY: 'Weekly (Mondays)',
    NEVER: 'Never (save only)',
  };

  return labels[frequency] || frequency;
}

/**
 * Check if it's time to send alert based on frequency
 */
export function shouldSendAlert(
  frequency: AlertFrequency,
  lastSent: Date | null,
  now: Date = new Date()
): boolean {
  if (frequency === 'NEVER') {
    return false;
  }

  if (frequency === 'INSTANT') {
    return true; // Always send for instant alerts
  }

  if (!lastSent) {
    return true; // Never sent before
  }

  const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

  if (frequency === 'DAILY') {
    // Send if more than 20 hours since last alert (allows for some scheduling flexibility)
    return hoursSinceLastSent >= 20;
  }

  if (frequency === 'WEEKLY') {
    // Send if more than 6.5 days since last alert
    return hoursSinceLastSent >= 6.5 * 24;
  }

  return false;
}

/**
 * Generate search summary text
 */
export function generateSearchSummary(filters: SavedSearchFilters): string {
  const parts: string[] = [];

  if (filters.searchQuery) {
    parts.push(`"${filters.searchQuery}"`);
  }

  if (filters.country) {
    parts.push(`in ${filters.country}`);
  }

  if (filters.subject) {
    parts.push(`teaching ${filters.subject}`);
  }

  if (filters.minSalary) {
    parts.push(`$${filters.minSalary}+ per month`);
  }

  if (filters.housingProvided) {
    parts.push('with housing');
  }

  if (filters.flightProvided) {
    parts.push('with flight');
  }

  if (parts.length === 0) {
    return 'All jobs';
  }

  return parts.join(' ');
}
