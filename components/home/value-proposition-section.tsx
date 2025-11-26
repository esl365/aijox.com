'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Users, Sparkles, Target, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ValueCard {
  title: string;
  description: string;
  features: string[];
  cta: {
    label: string;
    href: string;
  };
  icon: React.ReactNode;
  gradient: string;
  illustration?: React.ReactNode;
}

interface ValuePropositionSectionProps {
  teacherCard?: Partial<ValueCard>;
  recruiterCard?: Partial<ValueCard>;
}

const defaultTeacherCard: ValueCard = {
  title: 'For Teachers',
  description: 'Discover international teaching opportunities tailored to your experience and preferences.',
  features: [
    'AI-powered job matching',
    'One-click applications',
    'Visa sponsorship filter',
    'Salary transparency',
  ],
  cta: {
    label: 'Find Your Dream Job',
    href: '/jobs',
  },
  icon: <Search className="h-8 w-8" />,
  gradient: 'from-[#5865F2] to-[#4ECDC4]',
};

const defaultRecruiterCard: ValueCard = {
  title: 'For Schools',
  description: 'Connect with qualified international educators using AI-powered recruiting tools.',
  features: [
    'Smart candidate matching',
    'Video screening insights',
    'Automated outreach',
    'Talent pipeline management',
  ],
  cta: {
    label: 'Start Hiring',
    href: '/recruiter',
  },
  icon: <Users className="h-8 w-8" />,
  gradient: 'from-[#FF6B6B] to-[#FFE66D]',
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.2,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function ValueCard({ card, index }: { card: ValueCard; index: number }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="group relative"
    >
      <div className="relative h-full p-8 md:p-10 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
        {/* Background Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />

        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} text-white mb-6`}
        >
          {card.icon}
        </div>

        {/* Content */}
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {card.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {card.description}
        </p>

        {/* Features List */}
        <ul className="space-y-3 mb-8">
          {card.features.map((feature, i) => (
            <motion.li
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
            >
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </motion.li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          asChild
          size="lg"
          className={`w-full bg-gradient-to-r ${card.gradient} text-white hover:opacity-90 group/btn`}
        >
          <Link href={card.cta.href}>
            {card.cta.label}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

export function ValuePropositionSection({
  teacherCard = {},
  recruiterCard = {},
}: ValuePropositionSectionProps) {
  const teacher = { ...defaultTeacherCard, ...teacherCard } as ValueCard;
  const recruiter = { ...defaultRecruiterCard, ...recruiterCard } as ValueCard;

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Built for both sides
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Whether you're looking for your next teaching adventure or searching for the perfect candidate, we've got you covered.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          <ValueCard card={teacher} index={0} />
          <ValueCard card={recruiter} index={1} />
        </div>

        {/* AI Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 md:mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5865F2]/10 to-[#FF6B6B]/10 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Sparkles className="h-4 w-4 text-[#5865F2]" />
            <span>Powered by AI matching technology</span>
            <Target className="h-4 w-4 text-[#FF6B6B]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
