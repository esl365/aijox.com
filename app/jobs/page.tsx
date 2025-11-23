import { Suspense } from 'react';
import { Metadata } from 'next';
import { JobsPageClient } from './JobsPageClient';
import { getJobFilterOptions, getJobStatsByCountry } from '@/app/actions/jobs';
import { Navigation } from '@/components/shared/navigation';

export const metadata: Metadata = {
  title: 'Browse International Teaching Jobs',
  description: 'Find verified teaching positions in Asia and Middle East. Filter by country, subject, and salary. Housing and flight benefits available.',
  openGraph: {
    title: 'International Teaching Jobs - Global Educator Nexus',
    description: 'Browse verified teaching positions in South Korea, China, UAE, Japan, and more. Competitive salaries with housing and flight benefits.',
  }
};

async function JobsStats() {
  const stats = await getJobStatsByCountry();

  if (stats.length === 0) return null;

  return (
    <div className="bg-muted/50 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Jobs by Country</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.slice(0, 10).map((stat) => (
          <div key={stat.country} className="text-center">
            <p className="text-2xl font-bold text-primary">{stat.count}</p>
            <p className="text-sm text-muted-foreground">{stat.country}</p>
            <p className="text-xs text-muted-foreground">
              Avg ${stat.avgSalary.toLocaleString()}/mo
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function JobsPage() {
  // Fetch filter options on server
  const filterOptions = await getJobFilterOptions();

  return (
    <>
      {/* Navigation Header */}
      <Navigation />

      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-2">
              International Teaching Jobs
            </h1>
            <p className="text-muted-foreground text-lg">
              Verified positions with competitive salaries and benefits
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Section */}
          <Suspense fallback={<div className="h-32 bg-muted/20 rounded-lg mb-6 animate-pulse" />}>
            <JobsStats />
          </Suspense>

          {/* Main Content */}
          <JobsPageClient filterOptions={filterOptions} />
        </div>
      </div>
    </>
  );
}
