/**
 * Hook for managing service worker updates
 */

'use client';

import { useState, useEffect } from 'react';

export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Get the current registration
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        setRegistration(reg);

        // Check for updates periodically
        const checkForUpdates = () => {
          reg.update();
        };

        // Check every hour
        const intervalId = setInterval(checkForUpdates, 60 * 60 * 1000);

        // Check immediately
        checkForUpdates();

        return () => clearInterval(intervalId);
      }
    });

    // Listen for update found
    const handleUpdateFound = () => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.installing) {
          const newWorker = reg.installing;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed and ready
              setUpdateAvailable(true);
            }
          });
        }
      });
    };

    navigator.serviceWorker.addEventListener('updatefound', handleUpdateFound);

    return () => {
      navigator.serviceWorker.removeEventListener('updatefound', handleUpdateFound);
    };
  }, []);

  const updateServiceWorker = () => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Reload the page when the new service worker activates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  };

  return {
    updateAvailable,
    updateServiceWorker,
  };
}
