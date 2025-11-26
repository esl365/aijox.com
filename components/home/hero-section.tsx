'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingTags } from './floating-tags';
import { RotatingText } from './rotating-text';

interface HeroSectionProps {
  headline?: string;
  rotatingWords?: string[];
  subheadline?: string;
  primaryCTA?: {
    label: string;
    href: string;
  };
  secondaryCTA?: {
    label: string;
    href: string;
  };
}

const defaultRotatingWords = [
  'teaching career',
  'dream school',
  'perfect match',
  'global adventure',
  'next opportunity',
];

export function HeroSection({
  headline = 'Find your next',
  rotatingWords = defaultRotatingWords,
  subheadline = 'Connect with top international schools worldwide. AI-powered matching to find your perfect teaching position.',
  primaryCTA = { label: 'Browse Jobs', href: '/jobs' },
  secondaryCTA = { label: "I'm Hiring", href: '/recruiter' },
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
    >
      {/* Floating Tags Background */}
      <FloatingTags tags={[]} />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#5865F2]/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#FF6B6B]/20 to-transparent rounded-full blur-3xl" />

      {/* Main Content */}
      <motion.div
        style={{ opacity, y }}
        className="container relative z-10 mx-auto px-4 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-gray-900 dark:text-white">{headline}</span>
            <br />
            <RotatingText words={rotatingWords} className="mt-2" />
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10"
          >
            {subheadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="min-w-[180px] h-14 text-lg bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 group"
            >
              <Link href={primaryCTA.href}>
                {primaryCTA.label}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-w-[180px] h-14 text-lg border-2"
            >
              <Link href={secondaryCTA.href}>{secondaryCTA.label}</Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-gray-400"
        >
          <span className="text-sm font-medium">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
