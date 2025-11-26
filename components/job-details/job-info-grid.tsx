'use client';

import { cn } from '@/lib/utils';

interface JobInfoGridProps {
  contractLength?: number | null;
  startDate?: Date | null;
  location: {
    city: string;
    country: string;
  };
  visaSponsorship?: boolean;
  housingProvided: boolean;
  flightProvided: boolean;
  subjects: string[];
}

export function JobInfoGrid({
  contractLength,
  startDate,
  location,
  visaSponsorship = false,
  housingProvided,
  flightProvided,
  subjects,
}: JobInfoGridProps) {
  const formatStartDate = (date: Date | null | undefined) => {
    if (!date) return 'Flexible';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const benefits = [
    housingProvided && 'Housing',
    flightProvided && 'Flights',
  ].filter(Boolean);

  const gridItems = [
    {
      label: 'CONTRACT',
      value: contractLength ? `${contractLength} months` : 'Ongoing',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'START DATE',
      value: formatStartDate(startDate),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'LOCATION',
      value: `${location.city}, ${location.country}`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'VISA',
      value: visaSponsorship ? 'Sponsorship Available' : 'Not Provided',
      highlight: visaSponsorship,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
    },
    {
      label: 'BENEFITS',
      value: benefits.length > 0 ? benefits.join(', ') : 'Standard',
      highlight: benefits.length > 0,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
    },
    {
      label: 'SUBJECTS',
      tags: subjects.length > 0 ? subjects : ['General'],
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 py-8 border-y border-gray-200 dark:border-gray-800">
      {gridItems.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center gap-2 text-gray-400">
            <span className="[&>svg]:w-5 [&>svg]:h-5">{item.icon}</span>
            <p className="text-xs uppercase tracking-wider font-semibold">
              {item.label}
            </p>
          </div>

          {'tags' in item && item.tags ? (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 2 && (
                <span className="px-2.5 py-1 text-gray-400 text-sm">
                  +{item.tags.length - 2}
                </span>
              )}
            </div>
          ) : (
            <p
              className={cn(
                'text-base font-semibold text-gray-900 dark:text-white',
                item.highlight && 'text-green-600 dark:text-green-400'
              )}
            >
              {item.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
