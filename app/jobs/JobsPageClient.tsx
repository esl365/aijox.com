'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobCategorySection } from '@/components/jobs/job-category-section';
import { JobsSidebar } from '@/components/jobs/jobs-sidebar';
import { JobCardWellfound } from '@/components/jobs/job-card-wellfound';
import { JobFiltersEnhanced } from '@/components/jobs/JobFiltersEnhanced';
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

// Helper to format date
function formatPostedAt(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

// Helper to format salary
function formatSalary(salary: number): string {
  if (salary >= 1000) {
    return `$${(salary / 1000).toFixed(0)}K/mo`;
  }
  return `$${salary}/mo`;
}

// Convert JobPosting to card format
function toJobCardData(job: JobPosting) {
  const benefits: string[] = [];
  if (job.housingProvided) benefits.push('Housing');
  if (job.flightProvided) benefits.push('Flight');

  return {
    id: job.id,
    company: {
      name: job.schoolName,
    },
    title: job.title,
    location: `${job.city}, ${job.country}`,
    salary: formatSalary(job.salaryUSD),
    benefits,
    postedAt: formatPostedAt(job.createdAt),
    subject: job.subject,
  };
}

// Define job categories for education
const jobCategories = [
  { id: 'trending', title: 'Trending teaching jobs', icon: '🔥', filter: {} },
  { id: 'stem', title: 'STEM Teaching jobs', icon: '🔬', filter: { subject: 'Science' } },
  { id: 'languages', title: 'Language Teaching jobs', icon: '🌍', filter: { subject: 'English' } },
  { id: 'elementary', title: 'Elementary Education jobs', icon: '📚', filter: { subject: 'Elementary' } },
  { id: 'secondary', title: 'Secondary Education jobs', icon: '🎓', filter: { subject: 'High School' } },
];

export function JobsPageClient({ filterOptions }: JobsPageClientProps) {
  const searchParams = useSearchParams();

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

  // Mobile filter visibility
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const pageSize = 20;

  // Initialize filters from URL search params
  useEffect(() => {
    const q = searchParams.get('q');
    const location = searchParams.get('location');

    if (q || location) {
      setFilters(prev => ({
        ...prev,
        ...(q && { search: q }),
        ...(location && { countries: [location] }),
      }));
    }
  }, [searchParams]);

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
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  // Group jobs by category (for category view)
  const jobsByCategory = useMemo(() => {
    if (Object.keys(filters).length > 0) {
      // If filters are active, show all jobs in a single list
      return null;
    }
    // Group jobs by subject for category display
    return jobs;
  }, [jobs, filters]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12">
      {/* Main Content */}
      <main>
        {/* View Toggle & Controls */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <JobViewToggle
              view={view}
              onChange={handleViewChange}
              jobCount={total}
            />

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              Filters
            </Button>
          </div>

          {!loading && !mapLoading && total > 0 && Object.keys(filters).length > 0 && (
            <SaveSearchDialog filters={filters} />
          )}
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="lg:hidden mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <JobFiltersEnhanced
              onFilterChange={handleFilterChange}
              filterOptions={filterOptions}
            />
          </div>
        )}

        {/* Desktop Filters (inline) */}
        <div className="hidden lg:block mb-6">
          <JobFiltersEnhanced
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
            variant="inline"
          />
        </div>

        {/* List View */}
        {view === 'list' && (
          <>
            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Job List - Wellfound Style */}
            {!loading && jobs.length > 0 && (
              <div>
                {Object.keys(filters).length === 0 ? (
                  // Show categorized view when no filters
                  <JobCategorySection
                    title="All teaching jobs"
                    viewAllLink="/jobs?view=all"
                    viewAllText={`View all ${total} jobs`}
                    jobs={jobs.map(toJobCardData)}
                    icon="📋"
                  />
                ) : (
                  // Show flat list when filters are active
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {total} jobs found
                    </h2>
                    <div>
                      {jobs.map((job) => (
                        <JobCardWellfound key={job.id} {...toJobCardData(job)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && jobs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({});
                    setPage(1);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}

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
                <span className="flex items-center px-4 text-sm text-gray-500">
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
              <div className="h-full w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm font-medium text-gray-500">
                    Loading map...
                  </p>
                </div>
              </div>
            ) : (
              <JobMapWrapper
                initialJobs={mapJobs}
                filters={filters}
                onJobSelect={(jobId) => {
                  console.log('Selected job:', jobId);
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Sidebar */}
      <aside className="hidden lg:block">
        <JobsSidebar />
      </aside>
    </div>
  );
}
