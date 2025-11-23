/**
 * Unit tests for PWA install tracking utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getVisitCount,
  getTimeOnSite,
  shouldShowInstallPrompt,
  markPromptShown,
  dismissInstallPrompt,
  resetTrackingData,
  getTrackingStats,
} from '@/lib/pwa/install-tracking';

describe('install-tracking', () => {
  // Mock localStorage and sessionStorage
  let localStorageMock: { [key: string]: string };
  let sessionStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};
    sessionStorageMock = {};

    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      key: vi.fn((index: number) => Object.keys(localStorageMock)[index] || null),
      length: 0,
    };

    global.sessionStorage = {
      getItem: vi.fn((key: string) => sessionStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        sessionStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete sessionStorageMock[key];
      }),
      clear: vi.fn(() => {
        sessionStorageMock = {};
      }),
      key: vi.fn((index: number) => Object.keys(sessionStorageMock)[index] || null),
      length: 0,
    };

    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getVisitCount', () => {
    it('should initialize visit count to 1 on first call', () => {
      const count = getVisitCount();
      expect(count).toBe(1);
      expect(localStorage.setItem).toHaveBeenCalledWith('pwa_visit_count', '1');
    });

    it('should increment existing visit count', () => {
      localStorageMock['pwa_visit_count'] = '5';
      const count = getVisitCount();
      expect(count).toBe(6);
      expect(localStorage.setItem).toHaveBeenCalledWith('pwa_visit_count', '6');
    });

    it('should handle invalid stored values', () => {
      localStorageMock['pwa_visit_count'] = 'invalid';
      const count = getVisitCount();
      // parseInt('invalid') returns NaN, NaN + 1 = NaN
      expect(count).toBeNaN();
      expect(localStorage.setItem).toHaveBeenCalledWith('pwa_visit_count', 'NaN');
    });

    it('should return 0 in server environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const count = getVisitCount();
      expect(count).toBe(0);

      global.window = originalWindow;
    });
  });

  describe('getTimeOnSite', () => {
    it('should return 0 in server environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const time = getTimeOnSite();
      expect(time).toBe(0);

      global.window = originalWindow;
    });

    it('should set start time on first call', () => {
      const mockNow = 1234567890000;
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      getTimeOnSite();
      expect(sessionStorage.setItem).toHaveBeenCalledWith('pwa_session_start', mockNow.toString());

      vi.useRealTimers();
    });

    it('should calculate time on site in seconds', () => {
      vi.useFakeTimers();

      const startTime = 1234567890000;
      const currentTime = startTime + 60000; // 60 seconds later

      sessionStorageMock['pwa_session_start'] = startTime.toString();
      vi.setSystemTime(currentTime);

      const time = getTimeOnSite();
      expect(time).toBe(60);

      vi.useRealTimers();
    });

    it('should not overwrite existing session start time', () => {
      const startTime = 1000000000000;
      sessionStorageMock['pwa_session_start'] = startTime.toString();

      getTimeOnSite();

      // Should only be called once with the initial value
      expect(sessionStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('shouldShowInstallPrompt', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return false in server environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const result = shouldShowInstallPrompt();
      expect(result).toBe(false);

      global.window = originalWindow;
    });

    it('should return false if prompt was recently dismissed', () => {
      const now = Date.now();
      const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
      localStorageMock['pwa_install_prompt_dismissed'] = threeDaysAgo.toString();

      expect(shouldShowInstallPrompt()).toBe(false);
    });

    it('should return true if prompt was dismissed more than 7 days ago', () => {
      const now = Date.now();
      const eightDaysAgo = now - (8 * 24 * 60 * 60 * 1000);
      localStorageMock['pwa_install_prompt_dismissed'] = eightDaysAgo.toString();
      localStorageMock['pwa_visit_count'] = '2';

      expect(shouldShowInstallPrompt()).toBe(true);
    });

    it('should return false if prompt was shown within last 24 hours', () => {
      const now = Date.now();
      const twelveHoursAgo = now - (12 * 60 * 60 * 1000);
      localStorageMock['pwa_last_prompt_shown'] = twelveHoursAgo.toString();
      localStorageMock['pwa_visit_count'] = '5';

      expect(shouldShowInstallPrompt()).toBe(false);
    });

    it('should return true if visit count meets minimum', () => {
      // getVisitCount increments on call, so set it to 1 to get 2
      localStorageMock['pwa_visit_count'] = '1';
      expect(shouldShowInstallPrompt(2, 30)).toBe(true);
    });

    it('should return true if time on site meets minimum', () => {
      const now = Date.now();
      const startTime = now - (45 * 1000); // 45 seconds ago
      sessionStorageMock['pwa_session_start'] = startTime.toString();

      expect(shouldShowInstallPrompt(10, 30)).toBe(true);
    });

    it('should return false if neither condition is met', () => {
      localStorageMock['pwa_visit_count'] = '0'; // Will be 1 after getVisitCount
      const now = Date.now();
      const startTime = now - (15 * 1000); // 15 seconds ago
      sessionStorageMock['pwa_session_start'] = startTime.toString();

      expect(shouldShowInstallPrompt(10, 30)).toBe(false);
    });

    it('should use custom thresholds', () => {
      localStorageMock['pwa_visit_count'] = '4'; // Will be 5 after increment
      expect(shouldShowInstallPrompt(10, 60)).toBe(false);

      localStorageMock['pwa_visit_count'] = '9'; // Will be 10 after increment
      expect(shouldShowInstallPrompt(10, 60)).toBe(true);
    });
  });

  describe('markPromptShown', () => {
    it('should set prompt shown timestamp', () => {
      const mockNow = 1234567890000;
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      markPromptShown();
      expect(localStorage.setItem).toHaveBeenCalledWith('pwa_last_prompt_shown', mockNow.toString());

      vi.useRealTimers();
    });

    it('should handle server environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      markPromptShown();
      expect(localStorage.setItem).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });

  describe('dismissInstallPrompt', () => {
    it('should set prompt dismissed timestamp', () => {
      const mockNow = 1234567890000;
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      dismissInstallPrompt();
      expect(localStorage.setItem).toHaveBeenCalledWith('pwa_install_prompt_dismissed', mockNow.toString());

      vi.useRealTimers();
    });

    it('should handle server environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      dismissInstallPrompt();
      expect(localStorage.setItem).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });

  describe('resetTrackingData', () => {
    it('should remove all tracking data', () => {
      localStorageMock['pwa_visit_count'] = '5';
      localStorageMock['pwa_last_prompt_shown'] = '123456';
      sessionStorageMock['pwa_session_start'] = '987654';

      resetTrackingData();

      expect(localStorage.removeItem).toHaveBeenCalledWith('pwa_visit_count');
      expect(localStorage.removeItem).toHaveBeenCalledWith('pwa_last_prompt_shown');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('pwa_session_start');
    });

    it('should handle server environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      resetTrackingData();
      expect(localStorage.removeItem).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });

  describe('getTrackingStats', () => {
    it('should return default stats in server environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const stats = getTrackingStats();
      expect(stats).toEqual({
        visitCount: 0,
        timeOnSite: 0,
        promptDismissed: false,
        lastPromptShown: null,
      });

      global.window = originalWindow;
    });

    it('should return tracking statistics', () => {
      vi.useFakeTimers();
      const mockNow = 1234567890000;
      vi.setSystemTime(mockNow);

      localStorageMock['pwa_visit_count'] = '5';
      localStorageMock['pwa_install_prompt_dismissed'] = '123456';
      localStorageMock['pwa_last_prompt_shown'] = mockNow.toString();
      sessionStorageMock['pwa_session_start'] = (mockNow - 30000).toString();

      const stats = getTrackingStats();

      expect(stats.visitCount).toBe(5);
      expect(stats.timeOnSite).toBe(30); // 30 seconds
      expect(stats.promptDismissed).toBe(true);
      expect(stats.lastPromptShown).toEqual(new Date(mockNow));

      vi.useRealTimers();
    });

    it('should return null for lastPromptShown if not set', () => {
      const stats = getTrackingStats();
      expect(stats.lastPromptShown).toBeNull();
    });
  });
});
