'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface QuickFilter {
  label: string;
  href: string;
}

const quickFilters: QuickFilter[] = [
  { label: 'Featured jobs', href: '/jobs?featured=true' },
  { label: 'Remote jobs', href: '/jobs?remote=true' },
  { label: 'Jobs by Location', href: '/jobs?view=locations' },
  { label: 'Jobs by Subject', href: '/jobs?view=subjects' },
  { label: 'IB Schools', href: '/jobs?curriculum=ib' },
];

export function JobsGetStartedCTA() {
  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 text-center">
        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full mb-6">
            <span className="text-5xl">🌱</span>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Get started today
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
            Apply to jobs with one click and connect with schools searching for educators like you.
          </p>

          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white mb-8"
            asChild
          >
            <Link href="/signup">Create your profile</Link>
          </Button>
        </motion.div>

        {/* Quick Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {quickFilters.map((filter) => (
            <Link
              key={filter.label}
              href={filter.href}
              className="inline-flex items-center gap-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              {filter.label}
              <ChevronDown className="w-4 h-4" />
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
