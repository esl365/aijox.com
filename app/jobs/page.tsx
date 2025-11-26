import { Suspense } from 'react';
import { Metadata } from 'next';
import { JobsPageClient } from './JobsPageClient';
import { getJobFilterOptions } from '@/app/actions/jobs';
import { Navigation } from '@/components/shared/navigation';
import { JobsHero } from '@/components/jobs/jobs-hero';
import { TrendingSchools } from '@/components/jobs/trending-schools';
import { JobsGetStartedCTA } from '@/components/jobs/jobs-get-started-cta';
import { Footer } from '@/components/shared/footer';
import { prisma } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Browse International Teaching Jobs | Global Educator Nexus',
  description: 'Find verified teaching positions in Asia and Middle East. Filter by country, subject, and salary. Housing and flight benefits available.',
  openGraph: {
    title: 'International Teaching Jobs - Global Educator Nexus',
    description: 'Browse verified teaching positions in South Korea, China, UAE, Japan, and more. Competitive salaries with housing and flight benefits.',
  }
};

async function getTotalJobs() {
  const count = await prisma.jobPosting.count({
    where: { status: 'ACTIVE' }
  });
  return count;
}

async function getTrendingSchoolsData() {
  const schools = await prisma.schoolProfile.findMany({
    where: { isVerified: true },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { jobPostings: { where: { status: 'ACTIVE' } } }
      }
    }
  });

  return schools.map(school => ({
    id: school.id,
    name: school.schoolName,
    tagline: school.description?.slice(0, 50) || 'International School',
    location: `${school.city}, ${school.country}`,
    tags: [school.schoolType || 'International', 'K-12'].filter(Boolean),
    openPositions: school._count.jobPostings,
  }));
}

export default async function JobsPage() {
  // Fetch data in parallel
  const [filterOptions, totalJobs, trendingSchools] = await Promise.all([
    getJobFilterOptions(),
    getTotalJobs(),
    getTrendingSchoolsData(),
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation Header */}
      <Navigation />

      {/* Hero Section with Search */}
      <Suspense fallback={<div className="h-48 bg-gray-50 dark:bg-gray-900 animate-pulse" />}>
        <JobsHero totalJobs={totalJobs} />
      </Suspense>

      {/* Trending Schools */}
      <Suspense fallback={<div className="h-64 bg-white dark:bg-gray-950 animate-pulse" />}>
        <TrendingSchools schools={trendingSchools} />
      </Suspense>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <JobsPageClient filterOptions={filterOptions} />
      </div>

      {/* Get Started CTA */}
      <JobsGetStartedCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}
