/**
 * Error message component with retry functionality
 */

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
}: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {onRetry && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                {retryLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
