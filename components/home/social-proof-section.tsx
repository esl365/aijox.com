'use client';

import { motion } from 'framer-motion';
import { Users, Briefcase, Globe } from 'lucide-react';
import { AnimatedCounter } from './animated-counter';
import { LogoCarousel } from './logo-carousel';

interface Metric {
  value: number;
  label: string;
  suffix?: string;
  icon: React.ReactNode;
}

interface SocialProofSectionProps {
  metrics?: Metric[];
  showLogos?: boolean;
}

const defaultMetrics: Metric[] = [
  {
    value: 50000,
    label: 'Teachers Matched',
    suffix: '+',
    icon: <Users className="h-6 w-6" />,
  },
  {
    value: 2500,
    label: 'Partner Schools',
    suffix: '+',
    icon: <Briefcase className="h-6 w-6" />,
  },
  {
    value: 85,
    label: 'Countries',
    suffix: '',
    icon: <Globe className="h-6 w-6" />,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function SocialProofSection({
  metrics = defaultMetrics,
  showLogos = true,
}: SocialProofSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Metrics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              variants={itemVariants}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 mb-4 group-hover:bg-gray-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-gray-900 transition-colors duration-300">
                {metric.icon}
              </div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                <AnimatedCounter value={metric.value} suffix={metric.suffix} />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Partner Label */}
        {showLogos && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-center text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-6">
              Trusted by leading international schools
            </p>
            <LogoCarousel
              logos={[
                { name: 'British Council', src: '' },
                { name: 'Cambridge International', src: '' },
                { name: 'IB World Schools', src: '' },
                { name: 'COBIS', src: '' },
                { name: 'ECIS', src: '' },
                { name: 'NEASC', src: '' },
              ]}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
