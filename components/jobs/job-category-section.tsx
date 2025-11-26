'use client';

import Link from 'next/link';
import { JobCardWellfound } from './job-card-wellfound';

interface Job {
  id: string;
  company: {
    name: string;
    logo?: string;
    logoColor?: string;
  };
  title: string;
  location: string;
  salary?: string;
  benefits?: string[];
  postedAt: string;
  subject?: string;
}

interface JobCategorySectionProps {
  title: string;
  viewAllLink: string;
  viewAllText: string;
  jobs: Job[];
  icon?: string;
}

export function JobCategorySection({
  title,
  viewAllLink,
  viewAllText,
  jobs,
  icon,
}: JobCategorySectionProps) {
  if (jobs.length === 0) return null;

  return (
    <section className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        <Link
          href={viewAllLink}
          className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {viewAllText}
        </Link>
      </div>

      <div>
        {jobs.map((job) => (
          <JobCardWellfound key={job.id} {...job} />
        ))}
      </div>
    </section>
  );
}
