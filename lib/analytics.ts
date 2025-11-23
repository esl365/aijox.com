/**
 * Analytics Infrastructure - Task 2.1
 * Lightweight event tracking system
 */

export type AnalyticsEvent =
  | 'view_job'
  | 'click_apply'
  | 'submit_application'
  | 'complete_profile'
  | 'upload_video'
  | 'search_jobs';

interface EventData {
  userId?: string;
  jobId?: string;
  searchQuery?: string;
  [key: string]: any;
}

/**
 * Track analytics event
 * TODO: Store in database table AnalyticsEvents or send to PostHog
 */
export async function trackEvent(event: AnalyticsEvent, data?: EventData) {
  const timestamp = new Date().toISOString();

  // Log to console for now (replace with actual analytics service)
  console.log('[Analytics]', {
    event,
    data,
    timestamp,
  });

  // TODO: Send to analytics service or store in database
  // Example: await prisma.analyticsEvent.create({ data: { event, data, timestamp } });

  return { success: true, event, timestamp };
}

/**
 * Track page view
 */
export function trackPageView(path: string, userId?: string) {
  return trackEvent('view_job', { path, userId });
}

/**
 * Track job view
 */
export function trackJobView(jobId: string, userId?: string) {
  return trackEvent('view_job', { jobId, userId });
}

/**
 * Track application submission
 */
export function trackApplicationSubmit(jobId: string, userId: string) {
  return trackEvent('submit_application', { jobId, userId });
}

/**
 * Track search
 */
export function trackSearch(query: string, resultsCount: number, userId?: string) {
  return trackEvent('search_jobs', { searchQuery: query, resultsCount, userId });
}
