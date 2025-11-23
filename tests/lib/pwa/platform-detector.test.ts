/**
 * Unit tests for PWA platform detection utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectPlatform,
  isStandalone,
  supportsServiceWorker,
  supportsPushNotifications,
  supportsInstallPrompt,
  getPlatformName,
  type Platform,
} from '@/lib/pwa/platform-detector';

describe('platform-detector', () => {
  // Store original values
  const originalNavigator = global.navigator;
  const originalWindow = global.window;

  afterEach(() => {
    // Restore original values
    global.navigator = originalNavigator;
    global.window = originalWindow;
  });

  describe('detectPlatform', () => {
    it('should return "unknown" in server environment', () => {
      // @ts-ignore
      delete global.window;
      expect(detectPlatform()).toBe('unknown');
    });

    it('should detect iOS platform', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      } as Navigator;

      expect(detectPlatform()).toBe('ios');
    });

    it('should detect iPad as iOS', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
      } as Navigator;

      expect(detectPlatform()).toBe('ios');
    });

    it('should detect Android platform', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (Linux; Android 10)',
      } as Navigator;

      expect(detectPlatform()).toBe('android');
    });

    it('should detect desktop platform', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      } as Navigator;

      expect(detectPlatform()).toBe('desktop');
    });

    it('should detect macOS as desktop', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      } as Navigator;

      expect(detectPlatform()).toBe('desktop');
    });
  });

  describe('isStandalone', () => {
    it('should return false in server environment', () => {
      // @ts-ignore
      delete global.window;
      expect(isStandalone()).toBe(false);
    });

    it('should detect iOS standalone mode', () => {
      global.navigator = {
        ...originalNavigator,
        // @ts-ignore
        standalone: true,
      } as Navigator;

      expect(isStandalone()).toBe(true);
    });

    it('should detect display-mode standalone', () => {
      // Mock matchMedia
      global.window = {
        ...originalWindow,
        matchMedia: vi.fn((query: string) => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      } as any;

      expect(isStandalone()).toBe(true);
    });

    it('should return false when not standalone', () => {
      global.window = {
        ...originalWindow,
        matchMedia: vi.fn(() => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      } as any;

      global.navigator = {
        ...originalNavigator,
        // @ts-ignore
        standalone: false,
      } as Navigator;

      expect(isStandalone()).toBe(false);
    });
  });

  describe('supportsServiceWorker', () => {
    it('should return false in server environment', () => {
      // @ts-ignore
      delete global.window;
      expect(supportsServiceWorker()).toBe(false);
    });

    it('should return true when serviceWorker is supported', () => {
      global.navigator = {
        ...originalNavigator,
        serviceWorker: {} as ServiceWorkerContainer,
      } as Navigator;

      expect(supportsServiceWorker()).toBe(true);
    });

    it('should return false when serviceWorker is not supported', () => {
      global.navigator = {
        ...originalNavigator,
      } as Navigator;

      // @ts-ignore
      delete global.navigator.serviceWorker;

      expect(supportsServiceWorker()).toBe(false);
    });
  });

  describe('supportsPushNotifications', () => {
    it('should return false in server environment', () => {
      // @ts-ignore
      delete global.window;
      expect(supportsPushNotifications()).toBe(false);
    });

    it('should return true when PushManager is supported', () => {
      global.window = {
        ...originalWindow,
        PushManager: {} as any,
      } as any;

      expect(supportsPushNotifications()).toBe(true);
    });

    it('should return false when PushManager is not supported', () => {
      global.window = {
        ...originalWindow,
      } as any;

      // @ts-ignore
      delete global.window.PushManager;

      expect(supportsPushNotifications()).toBe(false);
    });
  });

  describe('supportsInstallPrompt', () => {
    it('should return false for iOS', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      } as Navigator;

      expect(supportsInstallPrompt()).toBe(false);
    });

    it('should return true for Android', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (Linux; Android 10)',
      } as Navigator;

      expect(supportsInstallPrompt()).toBe(true);
    });

    it('should return true for desktop', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      } as Navigator;

      expect(supportsInstallPrompt()).toBe(true);
    });
  });

  describe('getPlatformName', () => {
    it('should return correct name for iOS', () => {
      expect(getPlatformName('ios')).toBe('iOS');
    });

    it('should return correct name for Android', () => {
      expect(getPlatformName('android')).toBe('Android');
    });

    it('should return correct name for Desktop', () => {
      expect(getPlatformName('desktop')).toBe('Desktop');
    });

    it('should return correct name for Unknown', () => {
      expect(getPlatformName('unknown')).toBe('Unknown');
    });

    it('should detect platform if not provided', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      } as Navigator;

      expect(getPlatformName()).toBe('iOS');
    });
  });
});
