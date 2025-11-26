'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface JobsHeroProps {
  totalJobs?: number;
}

export function JobsHero({ totalJobs = 150 }: JobsHeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobTitle, setJobTitle] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (jobTitle) params.set('q', jobTitle);
    if (location) params.set('location', location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative py-8 md:py-12 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 relative z-10">
        {/* Title Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Find your next teaching position
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {totalJobs.toLocaleString()}+ verified international teaching jobs
            </p>
          </div>
        </div>

        {/* Full-Width Search Bar */}
        <form onSubmit={handleSearch} className="w-full">
          <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-gray-950 p-3 md:p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
            {/* Job Title Input */}
            <div className="relative flex-[2]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Job title, subject, or keyword"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="pl-12 h-14 text-base bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {/* Location Input */}
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Country or city"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-12 h-14 text-base bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              size="lg"
              className="h-14 px-10 text-base font-semibold bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-lg"
            >
              Search Jobs
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
