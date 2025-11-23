/**
 * Installation and visit tracking utilities for PWA
 */

const STORAGE_KEYS = {
  VISIT_COUNT: 'pwa_visit_count',
  SESSION_START: 'pwa_session_start',
  INSTALL_PROMPT_DISMISSED: 'pwa_install_prompt_dismissed',
  LAST_PROMPT_SHOWN: 'pwa_last_prompt_shown',
} as const;

/**
 * Gets and increments the visit count
 */
export function getVisitCount(): number {
  if (typeof window === 'undefined') return 0;

  const stored = localStorage.getItem(STORAGE_KEYS.VISIT_COUNT);
  const count = stored ? parseInt(stored, 10) : 0;
  const newCount = count + 1;

  localStorage.setItem(STORAGE_KEYS.VISIT_COUNT, newCount.toString());

  return newCount;
}

/**
 * Gets the time spent on site in current session (seconds)
 */
export function getTimeOnSite(): number {
  if (typeof window === 'undefined') return 0;

  let start = sessionStorage.getItem(STORAGE_KEYS.SESSION_START);

  if (!start) {
    start = Date.now().toString();
    sessionStorage.setItem(STORAGE_KEYS.SESSION_START, start);
  }

  const startTime = parseInt(start, 10);
  const now = Date.now();
  const timeInSeconds = Math.floor((now - startTime) / 1000);

  return timeInSeconds;
}

/**
 * Checks if the install prompt should be shown based on criteria
 */
export function shouldShowInstallPrompt(
  minVisits: number = 2,
  minTimeOnSite: number = 30 // seconds
): boolean {
  if (typeof window === 'undefined') return false;

  // Check if recently dismissed
  const dismissed = localStorage.getItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED);
  if (dismissed) {
    const dismissedTime = parseInt(dismissed, 10);
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Don't show again if dismissed within last 7 days
    if (daysSinceDismissed < 7) {
      return false;
    }
  }

  // Check if shown too recently
  const lastShown = localStorage.getItem(STORAGE_KEYS.LAST_PROMPT_SHOWN);
  if (lastShown) {
    const lastShownTime = parseInt(lastShown, 10);
    const hoursSinceShown = (Date.now() - lastShownTime) / (1000 * 60 * 60);

    // Don't show again if shown within last 24 hours
    if (hoursSinceShown < 24) {
      return false;
    }
  }

  const visits = getVisitCount();
  const timeOnSite = getTimeOnSite();

  // Show if user has visited enough times OR spent enough time
  return visits >= minVisits || timeOnSite >= minTimeOnSite;
}

/**
 * Marks the install prompt as dismissed
 */
export function dismissInstallPrompt(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED, Date.now().toString());
}

/**
 * Marks the install prompt as shown
 */
export function markPromptShown(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.LAST_PROMPT_SHOWN, Date.now().toString());
}

/**
 * Resets all tracking data (useful for testing)
 */
export function resetTrackingData(): void {
  if (typeof window === 'undefined') return;

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

/**
 * Gets tracking statistics for debugging/analytics
 */
export function getTrackingStats() {
  if (typeof window === 'undefined') {
    return {
      visitCount: 0,
      timeOnSite: 0,
      promptDismissed: false,
      lastPromptShown: null,
    };
  }

  return {
    visitCount: parseInt(localStorage.getItem(STORAGE_KEYS.VISIT_COUNT) || '0', 10),
    timeOnSite: getTimeOnSite(),
    promptDismissed: !!localStorage.getItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED),
    lastPromptShown: localStorage.getItem(STORAGE_KEYS.LAST_PROMPT_SHOWN)
      ? new Date(parseInt(localStorage.getItem(STORAGE_KEYS.LAST_PROMPT_SHOWN)!, 10))
      : null,
  };
}
