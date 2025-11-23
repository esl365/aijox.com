/**
 * Service Worker Update Notification Component
 * Shows when a new version is available
 */

'use client';

import { useServiceWorkerUpdate } from '@/lib/hooks/use-sw-update';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

export function UpdateNotification() {
  const { updateAvailable, updateServiceWorker } = useServiceWorkerUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-40 animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Update Available</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            A new version of EduNexus is available. Refresh to update.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={updateServiceWorker}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Update Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDismissed(true)}
            >
              Later
            </Button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
