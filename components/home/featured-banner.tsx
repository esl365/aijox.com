'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturedBannerProps {
  headline?: string;
  subheadline?: string;
  cta?: {
    label: string;
    href: string;
  };
  rating?: string;
}

export function FeaturedBanner({
  headline = '10 out of 10',
  subheadline = 'teachers recommend Global Educator Nexus to their colleagues',
  cta = { label: 'Join Today', href: '/auth/signin' },
  rating = '4.9/5',
}: FeaturedBannerProps) {
  return (
    <section className="py-8 md:py-12 bg-gray-900 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Left - Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Award className="h-10 w-10 text-yellow-400" />
              <div>
                <div className="text-4xl font-bold text-white">{headline}</div>
                <div className="text-gray-400 text-sm">{subheadline}</div>
              </div>
            </div>
          </div>

          {/* Middle - Stars */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <motion.svg
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="h-6 w-6 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </motion.svg>
              ))}
            </div>
            <span className="text-white font-semibold">{rating}</span>
          </div>

          {/* Right - CTA */}
          <Button
            asChild
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 group"
          >
            <Link href={cta.href}>
              {cta.label}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
