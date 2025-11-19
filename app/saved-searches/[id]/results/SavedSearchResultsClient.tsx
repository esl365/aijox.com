'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SavedSearch, JobPosting } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JobList } from '@/components/jobs/JobList';
import {
  generateSearchSummary,
  getAlertFrequencyLabel,
  type SavedSearchFilters,
  type AlertFrequency,
} from '@/lib/types/saved-search';

type SavedSearchResultsClientProps = {
  savedSearch: SavedSearch;
  jobs: JobPosting[];
  total: number;
};

export function SavedSearchResultsClient({
  savedSearch,
  jobs,
  total,
}: SavedSearchResultsClientProps) {
  const router = useRouter();
  const filters = savedSearch.filters as SavedSearchFilters;
  const alertFrequency = savedSearch.alertFrequency as AlertFrequency;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          ← Back to Saved Searches
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {savedSearch.name || 'Unnamed Search'}
            </h1>
            <p className="text-muted-foreground">
              {generateSearchSummary(filters)}
            </p>
          </div>
          <Badge variant={savedSearch.isActive ? 'default' : 'secondary'}>
            {savedSearch.isActive ? 'Active' : 'Paused'}
          </Badge>
        </div>
      </div>

      {/* Search Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Matches
              </p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Alert Frequency
              </p>
              <p className="text-lg font-semibold">
                {getAlertFrequencyLabel(alertFrequency)}
              </p>
            </div>
            {savedSearch.lastAlertSent && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Last Alert
                </p>
                <p className="text-lg font-semibold">
                  {new Date(savedSearch.lastAlertSent).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {savedSearch.lastMatchCount} jobs
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter Details */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Search Criteria</h3>
          <div className="flex flex-wrap gap-2">
            {filters.country && (
              <Badge variant="secondary">📍 {filters.country}</Badge>
            )}
            {filters.subject && (
              <Badge variant="secondary">📚 {filters.subject}</Badge>
            )}
            {filters.minSalary && (
              <Badge variant="secondary">💰 ${filters.minSalary}+ /month</Badge>
            )}
            {filters.maxSalary && (
              <Badge variant="secondary">💰 Up to ${filters.maxSalary} /month</Badge>
            )}
            {filters.housingProvided && (
              <Badge variant="secondary">🏠 Housing Provided</Badge>
            )}
            {filters.flightProvided && (
              <Badge variant="secondary">✈️ Flight Provided</Badge>
            )}
            {filters.searchQuery && (
              <Badge variant="secondary">🔍 "{filters.searchQuery}"</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Matching Jobs ({total})
        </h2>
        {!savedSearch.isActive && (
          <p className="text-sm text-muted-foreground">
            This search is paused. Resume it to receive alerts.
          </p>
        )}
      </div>

      {/* Job Results */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold">
              No jobs match your criteria yet
            </h3>
            <p className="mt-2 text-muted-foreground">
              {savedSearch.isActive
                ? "We'll notify you when new jobs are posted"
                : 'Resume this search to receive alerts'}
            </p>
            <div className="mt-4 flex gap-3 justify-center">
              <Link href="/jobs">
                <Button variant="outline">Browse All Jobs</Button>
              </Link>
              <Link href="/saved-searches">
                <Button>Manage Searches</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <JobList jobs={jobs} />
      )}

      {/* Help Card */}
      {jobs.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> These are all currently active jobs matching your
              search. New jobs will be sent to you based on your alert frequency (
              {getAlertFrequencyLabel(alertFrequency)}).
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
