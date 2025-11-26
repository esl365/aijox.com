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
    <div className="flex items-center gap-3">
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange('list')}
          className={`gap-2 ${
            view === 'list'
              ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
          }`}
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">List</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange('map')}
          className={`gap-2 ${
            view === 'map'
              ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
          }`}
        >
          <MapIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Map</span>
        </Button>
      </div>

      {jobCount !== undefined && (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
        </span>
      )}
    </div>
  );
}
