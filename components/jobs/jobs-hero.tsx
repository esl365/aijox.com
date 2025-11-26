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
    <section className="relative py-12 md:py-16 bg-white dark:bg-gray-950">
      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-6 left-[20%] text-2xl md:text-3xl opacity-60 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          🌍
        </span>
        <span className="absolute top-10 left-[45%] text-2xl md:text-3xl opacity-60 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
          📚
        </span>
        <span className="absolute top-4 right-[25%] text-2xl md:text-3xl opacity-60 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
          ✨
        </span>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <p className="text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 mb-4 uppercase">
          Over {totalJobs.toLocaleString()}+ verified international teaching positions
        </p>

        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Find what's next:
        </h1>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Job title or subject"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="pl-12 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg"
            />
          </div>

          <div className="relative flex-1 w-full">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Country or city"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-12 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg"
            />
          </div>

          <Button
            type="submit"
            className="h-12 px-8 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 w-full md:w-auto"
          >
            Search
          </Button>
        </form>
      </div>
    </section>
  );
}
