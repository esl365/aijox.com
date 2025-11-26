'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSimilarJobs } from '@/app/actions/recommendations';
import type { JobRecommendation } from '@/lib/db/job-recommendations';

interface SimilarJobsGridProps {
  jobId: string;
  limit?: number;
  className?: string;
}

export function SimilarJobsGrid({
  jobId,
  limit = 6,
  className = '',
}: SimilarJobsGridProps) {
  const [jobs, setJobs] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSimilarJobs() {
      try {
        setLoading(true);
        const result = await getSimilarJobs(jobId, limit);
        if (result.success) {
          setJobs(result.jobs);
        }
      } catch (err) {
        console.error('Failed to load similar jobs:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSimilarJobs();
  }, [jobId, limit]);

  if (loading) {
    return (
      <section className={className}>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Similar Jobs
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 h-[140px] animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return null;
  }

  const formatSalary = (salary: number) => {
    if (salary >= 1000) {
      return `$${(salary / 1000).toFixed(1)}K`;
    }
    return `$${salary}`;
  };

  return (
    <section className={className}>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Similar Jobs
      </h2>

      <div className="grid md:grid-cols-3 gap-5">
        {jobs.map((job) => (
          <Link key={job.id} href={`/jobs/${job.id}`} className="group">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 h-[140px] flex flex-col transition-all hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700">
              {/* Company */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    {job.schoolName.charAt(0)}
                  </span>
                </div>
                <span className="text-base font-medium text-gray-600 dark:text-gray-400 truncate">
                  {job.schoolName}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-auto group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {job.title}
              </h3>

              {/* Meta */}
              <div className="flex items-center gap-2 text-base text-gray-500 dark:text-gray-400">
                <span className="font-medium">{formatSalary(job.salaryUSD)}/mo</span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="truncate">
                  {job.city}, {job.country}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
