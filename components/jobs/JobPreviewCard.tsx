'use client';

/**
 * Job Preview Card Component
 * SPARC: Implementation Phase - UI Components
 *
 * Compact job preview shown on map markers
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Home, Plane, X, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { JobPreviewCardProps } from '@/lib/types/map';

export function JobPreviewCard({ job, onClose, className = '' }: JobPreviewCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/jobs/${job.id}`);
  };

  const handleQuickApply = () => {
    router.push(`/jobs/${job.id}?apply=true`);
  };

  return (
    <Card className={`w-80 shadow-xl ${className}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex-1 space-y-1">
          <CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{job.schoolName}</p>
        </div>

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 -mt-1 -mr-1"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>
            {job.city}, {job.country}
          </span>
        </div>

        {/* Salary */}
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <DollarSign className="h-4 w-4" />
          <span>${job.salaryUSD.toLocaleString()}/month</span>
        </div>

        {/* Subject & Employment Type */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            <Briefcase className="h-3 w-3 mr-1" />
            {job.subject}
          </Badge>
          {job.employmentType && (
            <Badge variant="outline" className="text-xs">
              {job.employmentType.replace('_', ' ')}
            </Badge>
          )}
        </div>

        {/* Benefits */}
        {(job.housingProvided || job.flightProvided) && (
          <div className="flex flex-wrap gap-2">
            {job.housingProvided && (
              <Badge variant="secondary" className="text-xs">
                <Home className="h-3 w-3 mr-1" />
                Housing
              </Badge>
            )}
            {job.flightProvided && (
              <Badge variant="secondary" className="text-xs">
                <Plane className="h-3 w-3 mr-1" />
                Flight
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1"
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button
            className="flex-1"
            size="sm"
            onClick={handleQuickApply}
          >
            Quick Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
