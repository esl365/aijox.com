/**
 * Hook for managing PWA install prompt
 */

'use client';

import { useState, useEffect } from 'react';
import { detectPlatform, supportsInstallPrompt } from '@/lib/pwa/platform-detector';
import {
  shouldShowInstallPrompt,
  markPromptShown,
  dismissInstallPrompt,
} from '@/lib/pwa/install-tracking';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform] = useState(detectPlatform());

  useEffect(() => {
    // Check if platform supports install prompt
    if (!supportsInstallPrompt()) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Check if we should show the prompt
      if (shouldShowInstallPrompt()) {
        setShowPrompt(true);
        markPromptShown();
      }
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);

      // Track installation
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pwa_installed', {
          platform,
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [platform]);

  const install = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const result = await deferredPrompt.userChoice;

    // Track the user's choice
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'install_prompt_result', {
        outcome: result.outcome,
        platform,
      });
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const dismiss = () => {
    setShowPrompt(false);
    dismissInstallPrompt();

    // Track dismissal
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'install_prompt_dismissed', {
        platform,
      });
    }
  };

  return {
    showPrompt,
    canInstall: !!deferredPrompt,
    platform,
    install,
    dismiss,
  };
}
