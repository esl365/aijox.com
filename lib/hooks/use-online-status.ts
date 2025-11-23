/**
 * Hook for tracking online/offline status
 */

'use client';

import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    // Handle online event
    const handleOnline = () => {
      setIsOnline(true);
    };

    // Handle offline event
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
