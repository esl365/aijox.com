'use client';

/**
 * HeroSection Component
 *
 * Enhanced hero section with animations based on Wellfound benchmark.
 * Features:
 * - Word-by-word animated headline
 * - Rotating subheadlines
 * - Dual CTAs (Find Jobs / Hire Teachers)
 * - Animated social proof metrics
 * - Quick navigation cards
 * - Parallax background elements
 *
 * Animation Timeline:
 * 1. Headline: Word-by-word reveal (0.0s - 1.0s)
 * 2. Subheadline: Fade + slide up (0.3s - 1.1s)
 * 3. CTAs: Scale + slide up (0.6s - 1.2s)
 * 4. Metrics: Stagger fade in (0.8s - 1.6s)
 * 5. Quick nav cards: Stagger slide up (1.0s - 2.0s)
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Users,
  Briefcase,
  Globe,
  GraduationCap,
  MapPin,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedText, AnimatedCounter } from './animated-text';
import { shouldReduceMotion } from '@/lib/design-system';
import { cn } from '@/lib/utils';
import type { HeroSectionProps } from '@/lib/design-system';

const DEFAULT_SUBHEADLINES = [
  'Connect with international schools worldwide',
  'Find your dream teaching position abroad',
  'Join thousands of educators teaching globally',
  'Experience new cultures while advancing your career',
];

const DEFAULT_SOCIAL_PROOF = [
  { value: 10000, label: 'Teachers', icon: <Users className="h-5 w-5" /> },
  { value: 5000, label: 'Schools', icon: <GraduationCap className="h-5 w-5" /> },
  { value: 50, label: 'Countries', icon: <Globe className="h-5 w-5" /> },
];

const DEFAULT_QUICK_NAV = [
  {
    title: 'Browse Jobs',
    description: 'Explore teaching opportunities worldwide',
    icon: <Briefcase className="h-6 w-6" />,
    href: '/jobs',
  },
  {
    title: 'Popular Destinations',
    description: 'Japan, China, UAE, and more',
    icon: <MapPin className="h-6 w-6" />,
    href: '/jobs?featured=true',
  },
  {
    title: 'High Salary',
    description: '$50K+ annual positions',
    icon: <DollarSign className="h-6 w-6" />,
    href: '/jobs?salaryMin=50000',
  },
  {
    title: 'Urgent Hiring',
    description: 'Positions starting soon',
    icon: <Clock className="h-6 w-6" />,
    href: '/jobs?urgent=true',
  },
];

export function HeroSection({
  headline = 'Find Your Next Teaching Adventure',
  subheadlines = DEFAULT_SUBHEADLINES,
  primaryCTA = {
    label: 'Find Teaching Jobs',
    href: '/jobs',
    variant: 'default' as const,
    icon: <ArrowRight className="ml-2 h-4 w-4" />,
  },
  secondaryCTA = {
    label: 'Hire Teachers',
    href: '/recruiter/signup',
    variant: 'outline' as const,
  },
  socialProof = DEFAULT_SOCIAL_PROOF,
  quickNavigationCards = DEFAULT_QUICK_NAV,
  className,
  ...props
}: HeroSectionProps) {
  const [currentSubheadline, setCurrentSubheadline] = useState(0);
  const { scrollY } = useScroll();

  // Parallax effect for background elements
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Rotate subheadlines
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubheadline((prev) => (prev + 1) % subheadlines.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [subheadlines.length]);

  return (
    <section
      className={cn(
        'relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32',
        className
      )}
      {...props}
    >
      {/* Background Elements */}
      {!shouldReduceMotion() && (
        <motion.div
          style={{ y, opacity }}
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        </motion.div>
      )}

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-5xl text-center">
          {/* Headline */}
          <AnimatedText
            text={headline}
            animation="wordByWord"
            stagger={0.03}
            as="h1"
            className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          />

          {/* Rotating Subheadline */}
          <div className="relative mb-8 h-16 overflow-hidden">
            {subheadlines.map((text, index) => (
              <motion.p
                key={index}
                initial={{ y: 100, opacity: 0 }}
                animate={{
                  y: index === currentSubheadline ? 0 : -100,
                  opacity: index === currentSubheadline ? 1 : 0,
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 text-lg text-muted-foreground sm:text-xl"
              >
                {text}
              </motion.p>
            ))}
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              variant={primaryCTA.variant}
              asChild
              className="min-w-[200px]"
            >
              <Link href={primaryCTA.href}>
                {primaryCTA.label}
                {primaryCTA.icon}
              </Link>
            </Button>

            <Button
              size="lg"
              variant={secondaryCTA.variant}
              asChild
              className="min-w-[200px]"
            >
              <Link href={secondaryCTA.href}>
                {secondaryCTA.label}
                {secondaryCTA.icon}
              </Link>
            </Button>
          </motion.div>

          {/* Social Proof Metrics */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mb-16 flex flex-wrap items-center justify-center gap-8 md:gap-12"
          >
            {socialProof.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  {metric.icon}
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold md:text-3xl">
                    <AnimatedCounter
                      value={metric.value}
                      duration={2}
                      suffix="+"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Navigation Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickNavigationCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0 + index * 0.1, duration: 0.5 }}
              >
                <Link href={card.href}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {card.icon}
                    </div>
                    <h3 className="mb-2 font-semibold">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                    {card.badge && (
                      <div className="absolute right-4 top-4">
                        <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                          {card.badge}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
