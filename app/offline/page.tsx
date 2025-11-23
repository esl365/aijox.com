/**
 * Offline Fallback Page
 * Shown when user is offline and requested page is not cached
 */

'use client';

import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OfflinePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);

    // Check if online
    if (navigator.onLine) {
      // Try to reload the page
      window.location.reload();
    } else {
      // Still offline
      setIsChecking(false);
      alert('You\'re still offline. Please check your internet connection.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <WifiOff className="h-10 w-10 text-gray-400" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          It looks like you've lost your internet connection. Some features may be limited until you're back online.
        </p>

        {/* Actions */}
        <div className="space-y-3 mb-6">
          <Button
            className="w-full"
            onClick={checkConnection}
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/dashboard')}
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 rounded-lg p-4 text-left">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">
            What you can do offline:
          </h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>View previously loaded pages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Browse cached job listings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Review your profile</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Your data will sync automatically when you're back online
          </p>
        </div>
      </div>
    </div>
  );
}
