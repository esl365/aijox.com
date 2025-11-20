'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-6">
            <AlertTriangle className="h-16 w-16 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Something went wrong
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            We're sorry, but something unexpected happened. Our team has been notified and we're working on it.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-gray-900">
                Error details (Development only)
              </summary>
              <div className="mt-2 p-4 bg-gray-100 rounded-lg text-sm font-mono overflow-auto">
                <p className="text-red-600 font-semibold">{error.message}</p>
                {error.digest && (
                  <p className="text-gray-600 mt-2">Digest: {error.digest}</p>
                )}
                {error.stack && (
                  <pre className="mt-2 text-xs text-gray-700 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" onClick={reset} className="gap-2 w-full sm:w-auto">
            <RefreshCw className="h-5 w-5" />
            Try Again
          </Button>
          <Link href="/">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="h-5 w-5" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="pt-8 border-t max-w-md mx-auto">
          <p className="text-sm text-muted-foreground mb-3">
            If this problem persists, please contact our support team:
          </p>
          <Link href="/contact" className="text-primary hover:underline font-medium">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
