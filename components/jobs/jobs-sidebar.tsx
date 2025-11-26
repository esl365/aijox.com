'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JobsSidebarProps {
  isLoggedIn?: boolean;
}

const features = [
  'Verified international schools only',
  'See salary & benefits upfront',
  'Instant visa eligibility check',
  'AI-powered job matching',
  'Let schools reach out to you',
];

export function JobsSidebar({ isLoggedIn = false }: JobsSidebarProps) {
  if (isLoggedIn) {
    return (
      <div className="sticky top-24 space-y-6">
        {/* Salary Calculator Card */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Know your worth
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Compare salaries by country, subject, and experience level.
          </p>
          <Button variant="outline" className="w-full bg-white dark:bg-gray-800">
            Salary calculator
          </Button>
        </div>

        {/* Job Alerts Card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Set up job alerts
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Get notified when new jobs match your preferences.
          </p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Create alert
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-24 space-y-6">
      {/* Sign Up Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <Button className="w-full mb-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100" asChild>
          <Link href="/signup">Sign up</Link>
        </Button>

        <div className="text-center text-sm text-gray-400 dark:text-gray-500 mb-4">or</div>

        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          asChild
        >
          <Link href="/api/auth/google">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </Link>
        </Button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>

      {/* Level Up Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Level up your job search
        </h3>

        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button variant="outline" className="w-full" asChild>
          <Link href="/signup">Sign up to search</Link>
        </Button>
      </div>

      {/* Salary Calculator Card */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Know your worth
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Compare salaries by country, subject, and experience level.
        </p>
        <Button variant="outline" className="bg-white dark:bg-gray-800">
          Salary calculator
        </Button>
      </div>
    </div>
  );
}
