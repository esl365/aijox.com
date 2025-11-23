/**
 * Platform detection utilities for PWA
 */

export type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

/**
 * Detects the current platform
 */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return 'ios';
  }

  // Android detection
  if (/android/i.test(userAgent)) {
    return 'android';
  }

  // Desktop (includes Chrome, Edge, Firefox, Safari on macOS/Windows)
  return 'desktop';
}

/**
 * Checks if the app is running in standalone mode (installed PWA)
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  // iOS standalone check
  if ((navigator as any).standalone) {
    return true;
  }

  // Android/Desktop standalone check
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  return false;
}

/**
 * Checks if the device supports service workers
 */
export function supportsServiceWorker(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator;
}

/**
 * Checks if the device supports push notifications
 */
export function supportsPushNotifications(): boolean {
  if (typeof window === 'undefined') return false;
  return 'PushManager' in window;
}

/**
 * Checks if the device supports the beforeinstallprompt event
 */
export function supportsInstallPrompt(): boolean {
  // iOS doesn't support beforeinstallprompt
  if (detectPlatform() === 'ios') return false;

  // Android and Desktop Chrome support it
  return true;
}

/**
 * Gets a user-friendly platform name
 */
export function getPlatformName(platform: Platform = detectPlatform()): string {
  const names: Record<Platform, string> = {
    ios: 'iOS',
    android: 'Android',
    desktop: 'Desktop',
    unknown: 'Unknown',
  };

  return names[platform];
}
