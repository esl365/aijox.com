'use client';

import { useState } from 'react';
import type { JobPosting } from '@prisma/client';
import { JobCardV2 } from '@/components/ui-v2/job-card-v2';
import { QuickApplyModal } from '@/components/ui-v2/quick-apply-modal';
import { useQuickApply } from '@/lib/stores/ui-store';
import type { JobCardData } from '@/lib/design-system';

type JobListProps = {
  jobs: JobPosting[];
  emptyMessage?: string;
};

// Convert JobPosting to JobCardData
function toJobCardData(job: JobPosting): JobCardData {
  return {
    id: job.id,
    title: job.title,
    school: job.schoolName,
    location: `${job.city}, ${job.country}`,
    country: job.country,
    city: job.city,
    salaryMin: job.salaryUSD,
    salaryMax: job.salaryUSD,
    currency: job.currency || 'USD',
    contractType: (job.employmentType as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT') || 'FULL_TIME',
    visaSponsorship: true,
    subjects: [job.subject],
    startDate: job.startDate?.toISOString() || new Date().toISOString(),
    postedAt: job.createdAt,
  };
}

export function JobList({ jobs, emptyMessage = 'No jobs found' }: JobListProps) {
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const { open: openQuickApply } = useQuickApply();

  const handleSave = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleQuickApply = (jobId: string) => {
    openQuickApply(jobId);
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
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
        <h3 className="mt-4 text-lg font-semibold">{emptyMessage}</h3>
        <p className="mt-2 text-muted-foreground">
          Try adjusting your filters or check back later for new opportunities.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {jobs.map((job) => (
          <JobCardV2
            key={job.id}
            job={toJobCardData(job)}
            isSaved={savedJobs.has(job.id)}
            onSave={handleSave}
            onQuickApply={handleQuickApply}
            showQuickApply
          />
        ))}
      </div>

      {/* Quick Apply Modal - uses internal store state */}
      <QuickApplyModal />
    </>
  );
}
