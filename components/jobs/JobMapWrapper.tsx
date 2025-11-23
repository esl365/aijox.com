'use client';

/**
 * Job Map Wrapper Component
 * SPARC: Implementation Phase - SSR Safe Map Loading
 *
 * Dynamic import wrapper for Leaflet map to prevent SSR issues
 */

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { JobMapProps } from '@/lib/types/map';

// Loading skeleton for map
function MapSkeleton() {
  return (
    <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading map...
        </p>
      </div>
    </div>
  );
}

// Dynamically import JobMap with SSR disabled
const JobMap = dynamic(() => import('./JobMap').then((mod) => mod.JobMap), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// Re-export with the same props interface
export function JobMapWrapper(props: JobMapProps) {
  return <JobMap {...props} />;
}
