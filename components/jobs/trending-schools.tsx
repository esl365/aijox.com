'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface TrendingSchool {
  id: string;
  name: string;
  logo?: string;
  logoColor?: string;
  tagline: string;
  location: string;
  tags: string[];
  openPositions: number;
}

interface TrendingSchoolsProps {
  schools?: TrendingSchool[];
}

const logoColors = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
  '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#6366F1',
];

function getLogoColor(name: string): string {
  const index = name.charCodeAt(0) % logoColors.length;
  return logoColors[index];
}

const defaultSchools: TrendingSchool[] = [
  {
    id: '1',
    name: 'Seoul International School',
    tagline: 'IB World School in Korea',
    location: 'Seoul, South Korea',
    tags: ['IB Curriculum', 'K-12'],
    openPositions: 8,
  },
  {
    id: '2',
    name: 'Dubai American Academy',
    tagline: 'Leading American curriculum school',
    location: 'Dubai, UAE',
    tags: ['American', 'High School'],
    openPositions: 12,
  },
  {
    id: '3',
    name: 'British School Tokyo',
    tagline: 'Excellence in British education',
    location: 'Tokyo, Japan',
    tags: ['British', 'Primary'],
    openPositions: 5,
  },
  {
    id: '4',
    name: 'Singapore International',
    tagline: 'Bilingual education excellence',
    location: 'Singapore',
    tags: ['IB', 'Bilingual'],
    openPositions: 15,
  },
  {
    id: '5',
    name: 'Shanghai Academy',
    tagline: 'Premier international education',
    location: 'Shanghai, China',
    tags: ['IB', 'STEM'],
    openPositions: 10,
  },
];

export function TrendingSchools({ schools = defaultSchools }: TrendingSchoolsProps) {
  return (
    <section className="py-8 md:py-12 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Trending schools hiring now
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {schools.map((school, index) => (
            <motion.div
              key={school.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/schools/${school.id}`}
                className="group block p-4 md:p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                {/* Logo */}
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-white font-bold text-base md:text-lg mb-3 md:mb-4"
                  style={{ backgroundColor: school.logoColor || getLogoColor(school.name) }}
                >
                  {school.name.charAt(0)}
                </div>

                {/* Info */}
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm md:text-base mb-1 line-clamp-1">
                  {school.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                  {school.tagline}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 md:mb-3">
                  {school.location}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-2 md:mb-3">
                  {school.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Open Positions */}
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {school.openPositions} open position{school.openPositions !== 1 ? 's' : ''}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
