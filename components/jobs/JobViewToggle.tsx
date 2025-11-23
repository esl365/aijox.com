'use client';

/**
 * Job View Toggle Component
 * SPARC: Implementation Phase - UI Components
 *
 * Allows switching between list and map view
 */

import { Button } from '@/components/ui/button';
import { List, MapIcon } from 'lucide-react';
import type { JobViewToggleProps } from '@/lib/types/map';

export function JobViewToggle({ view, onChange, jobCount }: JobViewToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        <Button
          variant={view === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onChange('list')}
          className="gap-2"
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">List</span>
        </Button>

        <Button
          variant={view === 'map' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onChange('map')}
          className="gap-2"
        >
          <MapIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Map</span>
        </Button>
      </div>

      {jobCount !== undefined && (
        <span className="text-sm text-muted-foreground">
          {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
        </span>
      )}
    </div>
  );
}
