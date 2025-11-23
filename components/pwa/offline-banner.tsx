/**
 * Offline Status Banner Component
 * Shows when the user goes offline
 */

'use client';

import { useOnlineStatus } from '@/lib/hooks/use-online-status';
import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setJustCameOnline(false);
    } else if (showBanner) {
      // User just came back online
      setJustCameOnline(true);

      // Hide the "back online" message after 3 seconds
      const timer = setTimeout(() => {
        setShowBanner(false);
        setJustCameOnline(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, showBanner]);

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        justCameOnline
          ? 'bg-green-600'
          : 'bg-yellow-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-white">
          {justCameOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">
                Back online!
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">
                You're offline. Some features may be limited.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
