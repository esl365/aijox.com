import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { VisaCheckResult } from '@/lib/visa/checker';

interface VisaStatusProps {
  country: string;
  result: VisaCheckResult;
  variant?: 'default' | 'compact';
}

export function VisaStatus({ country, result, variant = 'default' }: VisaStatusProps) {
  if (variant === 'compact') {
    return <VisaStatusCompact country={country} eligible={result.eligible} />;
  }

  if (result.eligible) {
    return (
      <div className="flex items-center gap-2 text-green-700">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-sm font-medium">Eligible for {country}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-red-700">
      <XCircle className="h-4 w-4" />
      <span className="text-sm font-medium">Not eligible for {country}</span>
    </div>
  );
}

// Compact badge version
export function VisaStatusCompact({
  country,
  eligible
}: {
  country: string;
  eligible: boolean;
}) {
  if (eligible) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        {country}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 gap-1">
      <XCircle className="h-3 w-3" />
      {country}
    </Badge>
  );
}

// Grid display for multiple countries
export function VisaStatusGrid({
  visaStatuses
}: {
  visaStatuses: Record<string, VisaCheckResult>;
}) {
  const eligible = Object.entries(visaStatuses).filter(([_, result]) => result.eligible);
  const notEligible = Object.entries(visaStatuses).filter(([_, result]) => !result.eligible);

  return (
    <div className="space-y-4">
      {eligible.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Eligible ({eligible.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {eligible.map(([country, result]) => (
              <VisaStatusCompact key={country} country={country} eligible={true} />
            ))}
          </div>
        </div>
      )}

      {notEligible.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Not Eligible ({notEligible.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {notEligible.map(([country, result]) => (
              <VisaStatusCompact key={country} country={country} eligible={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Warning badge for jobs
export function VisaWarningBadge({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
