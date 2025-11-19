'use client';

import { useState, useEffect } from 'react';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobList } from '@/components/jobs/JobList';
import { Button } from '@/components/ui/button';
import { SaveSearchDialog } from '@/components/saved-searches/SaveSearchDialog';
import { getJobs, type JobFilters as JobFiltersType } from '@/app/actions/jobs';
import type { JobPosting } from '@prisma/client';

type JobsPageClientProps = {
  filterOptions: {
    countries: string[];
    subjects: string[];
    salaryRange: { min: number; max: number };
  };
};

export function JobsPageClient({ filterOptions }: JobsPageClientProps) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const pageSize = 20;

  // Fetch jobs when filters or page change
  useEffect(() => {
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
  }, [filters, page]);

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
        <div className="sticky top-4">
          <JobFilters
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
          />
        </div>
      </aside>

      {/* Job Listings */}
      <main className="lg:col-span-3">
        {/* Results Count & Save Search */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {loading ? (
              'Loading...'
            ) : (
              <>
                Showing {jobs.length} of {total} jobs
                {page > 1 && ` (Page ${page})`}
              </>
            )}
          </p>
          {!loading && total > 0 && Object.keys(filters).length > 0 && (
            <SaveSearchDialog filters={filters} />
          )}
        </div>

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
      </main>
    </div>
  );
}
