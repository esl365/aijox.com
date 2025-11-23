'use client';

import { useState, useEffect } from 'react';
import { JobFiltersEnhanced } from '@/components/jobs/JobFiltersEnhanced';
import { JobList } from '@/components/jobs/JobList';
import { JobViewToggle } from '@/components/jobs/JobViewToggle';
import { JobMapWrapper } from '@/components/jobs/JobMapWrapper';
import { Button } from '@/components/ui/button';
import { SaveSearchDialog } from '@/components/saved-searches/SaveSearchDialog';
import { getJobs, type JobFilters as JobFiltersType } from '@/app/actions/jobs';
import { getJobsForMap } from '@/app/actions/map';
import type { JobPosting } from '@prisma/client';
import type { MapJob } from '@/lib/types/map';

type JobsPageClientProps = {
  filterOptions: {
    countries: string[];
    subjects: string[];
    employmentTypes: string[];
    salaryRange: { min: number; max: number };
  };
};

export function JobsPageClient({ filterOptions }: JobsPageClientProps) {
  // View state
  const [view, setView] = useState<'list' | 'map'>('list');

  // List view state
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Map view state
  const [mapJobs, setMapJobs] = useState<MapJob[]>([]);
  const [mapLoading, setMapLoading] = useState(false);

  const pageSize = 20;

  // Load view preference from localStorage on mount
  useEffect(() => {
    const savedView = localStorage.getItem('jobsViewPreference');
    if (savedView === 'map' || savedView === 'list') {
      setView(savedView);
    }
  }, []);

  // Save view preference to localStorage
  const handleViewChange = (newView: 'list' | 'map') => {
    setView(newView);
    localStorage.setItem('jobsViewPreference', newView);
  };

  // Fetch jobs when filters or page change (list view only)
  useEffect(() => {
    if (view !== 'list') return;

    const fetchJobs = async () => {
      setLoading(true);
      const response = await getJobs(filters, page, pageSize);
      setJobs(response.jobs);
      setHasMore(response.hasMore);
      setTotal(response.total);
      setLoading(false);

      // Scroll to top when filters change
      if (page === 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    fetchJobs();
  }, [filters, page, view]);

  // Fetch map jobs when in map view
  useEffect(() => {
    if (view !== 'map') return;

    const fetchMapJobs = async () => {
      setMapLoading(true);
      try {
        const response = await getJobsForMap(filters);
        setMapJobs(response.jobs);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to fetch map jobs:', error);
      } finally {
        setMapLoading(false);
      }
    };

    fetchMapJobs();
  }, [filters, view]);

  const handleFilterChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <aside className="lg:col-span-1">
        <div className="sticky top-20">
          <JobFiltersEnhanced
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
          />
        </div>
      </aside>

      {/* Job Listings */}
      <main className="lg:col-span-3">
        {/* View Toggle, Results Count & Save Search */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <JobViewToggle
              view={view}
              onChange={handleViewChange}
              jobCount={total}
            />
          </div>
          {!loading && !mapLoading && total > 0 && Object.keys(filters).length > 0 && (
            <SaveSearchDialog filters={filters} />
          )}
        </div>

        {/* List View */}
        {view === 'list' && (
          <>
            {/* Loading State */}
            {loading && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-muted/20 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Job List */}
            {!loading && <JobList jobs={jobs} />}

            {/* Pagination */}
            {!loading && jobs.length > 0 && (
              <div className="mt-8 flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Map View */}
        {view === 'map' && (
          <div className="h-[600px] rounded-lg overflow-hidden border shadow-sm">
            {mapLoading ? (
              <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Loading map...
                  </p>
                </div>
              </div>
            ) : (
              <JobMapWrapper
                initialJobs={mapJobs}
                filters={filters}
                onJobSelect={(jobId) => {
                  // Could add logic to open job detail modal here
                  console.log('Selected job:', jobId);
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
