'use client';

import { Badge } from '@/components/ui/badge';

interface JobTitleHeaderProps {
  title: string;
  salary: number;
  location: string;
  experienceYears?: number | null;
  employmentType?: string;
  subject: string;
}

export function JobTitleHeader({
  title,
  salary,
  location,
  experienceYears,
  employmentType = 'Full Time',
  subject,
}: JobTitleHeaderProps) {
  const formatSalary = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount}`;
  };

  const formatEmploymentType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="py-8">
      {/* Job Title - Much Larger */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
        {title}
      </h1>

      {/* Compensation & Location - Larger */}
      <div className="flex flex-wrap items-center gap-3 text-lg text-gray-600 dark:text-gray-400 mb-4">
        <span className="font-bold text-2xl text-gray-900 dark:text-white">
          {formatSalary(salary)}/mo
        </span>

        <span className="text-gray-300 dark:text-gray-600 text-2xl">•</span>

        <span className="flex items-center gap-1.5 text-lg">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {location}
        </span>
      </div>

      {/* Requirements - Larger Badges */}
      <div className="flex flex-wrap items-center gap-3 text-base text-gray-500 dark:text-gray-400">
        {experienceYears && experienceYears > 0 && (
          <>
            <span className="text-base">{experienceYears}+ years experience required</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
          </>
        )}

        <Badge variant="secondary" className="font-semibold text-sm px-3 py-1">
          {formatEmploymentType(employmentType)}
        </Badge>

        <span className="text-gray-300 dark:text-gray-600">•</span>

        <Badge variant="outline" className="font-semibold text-sm px-3 py-1">
          {subject}
        </Badge>
      </div>
    </div>
  );
}
