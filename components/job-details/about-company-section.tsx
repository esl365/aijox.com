'use client';

import Link from 'next/link';
import Image from 'next/image';

interface AboutCompanySectionProps {
  company: {
    id: string;
    name: string;
    logo?: string | null;
    website?: string | null;
    description?: string | null;
    city: string;
    country: string;
    schoolType?: string | null;
    isVerified?: boolean;
    teacherCount?: number;
    studentCount?: number;
    rating?: number;
    reviewCount?: number;
  };
}

export function AboutCompanySection({ company }: AboutCompanySectionProps) {
  const stats = [
    {
      label: 'Teachers',
      value: company.teacherCount ? `${company.teacherCount}+` : 'N/A',
    },
    {
      label: 'Students',
      value: company.studentCount
        ? company.studentCount.toLocaleString()
        : 'N/A',
    },
    {
      label: 'Type',
      value: company.schoolType || 'International',
    },
    {
      label: 'Rating',
      value: company.rating ? `${company.rating.toFixed(1)}/5` : 'New',
    },
  ];

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        About {company.name}
      </h2>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-white">
                  {company.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {company.name}
                </h3>
                {company.isVerified && (
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {company.city}, {company.country}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              >
                Website
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
            <Link
              href={`/schools/${company.id}`}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1"
            >
              View Profile
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
            {company.description}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
