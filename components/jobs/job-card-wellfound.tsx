'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface JobCardWellfoundProps {
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
  onApply?: (id: string) => void;
}

const logoColors = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
  '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#6366F1',
];

function getLogoColor(name: string): string {
  const index = name.charCodeAt(0) % logoColors.length;
  return logoColors[index];
}

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function JobCardWellfound({
  id,
  company,
  title,
  location,
  salary,
  benefits = [],
  postedAt,
  subject,
  onApply,
}: JobCardWellfoundProps) {
  const bgColor = company.logoColor || getLogoColor(company.name);

  return (
    <div className="group flex items-start gap-3 md:gap-4 py-4 md:py-5 px-3 md:px-4 -mx-3 md:-mx-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
      {/* Company Logo */}
      {company.logo ? (
        <img
          src={company.logo}
          alt={company.name}
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-white font-semibold text-base md:text-lg flex-shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          {getInitials(company.name)}
        </div>
      )}

      {/* Job Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/jobs/${id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm md:text-base">
            {title}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-1 text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">{company.name}</span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span>{location}</span>
          {salary && (
            <>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-green-600 dark:text-green-400 font-medium">{salary}</span>
            </>
          )}
          {subject && (
            <>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span>{subject}</span>
            </>
          )}
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span>{postedAt}</span>
        </div>

        {/* Benefits Tags */}
        {benefits.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {benefits.slice(0, 3).map((benefit) => (
              <span
                key={benefit}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {benefit}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Apply Button */}
      <Button
        variant="default"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 hidden md:flex"
        onClick={() => onApply?.(id)}
        asChild
      >
        <Link href={`/jobs/${id}/apply`}>Apply</Link>
      </Button>

      {/* Mobile: Always visible arrow */}
      <Link
        href={`/jobs/${id}`}
        className="md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
