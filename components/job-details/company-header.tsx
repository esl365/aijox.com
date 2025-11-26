'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CompanyHeaderProps {
  company: {
    id: string;
    name: string;
    logo?: string | null;
    isActivelyHiring?: boolean;
    isVerified?: boolean;
  };
  onSave?: () => void;
  onApply: () => void;
  isSaved?: boolean;
  isApplying?: boolean;
}

export function CompanyHeader({
  company,
  onSave,
  onApply,
  isSaved = false,
  isApplying = false,
}: CompanyHeaderProps) {
  return (
    <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-4">
        {/* Company Logo */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          {company.logo ? (
            <Image
              src={company.logo}
              alt={company.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-white">
              {company.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Company Info */}
        <div>
          <Link
            href={`/schools/${company.id}`}
            className="hover:underline inline-flex items-center gap-2"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {company.name}
            </h2>
            {company.isVerified && (
              <svg
                className="w-5 h-5 text-blue-500"
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
          </Link>

          {company.isActivelyHiring && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-full mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Actively Hiring
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {onSave && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className={cn(
              'gap-2',
              isSaved && 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
            )}
          >
            <svg
              className={cn('w-4 h-4', isSaved && 'fill-current')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        )}

        <Button
          size="sm"
          onClick={onApply}
          disabled={isApplying}
          className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
        >
          {isApplying ? 'Checking...' : 'Apply'}
        </Button>
      </div>
    </div>
  );
}
