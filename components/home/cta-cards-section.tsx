'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Calculator, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CTACard {
  title: string;
  description: string;
  cta: {
    label: string;
    href: string;
  };
  icon: React.ReactNode;
  gradient: string;
  badge?: string;
}

interface CTACardsSectionProps {
  cards?: CTACard[];
}

const defaultCards: CTACard[] = [
  {
    title: 'Get Featured',
    description: 'Stand out from other candidates with a premium profile that gets 5x more views from recruiters.',
    cta: {
      label: 'Boost Your Profile',
      href: '/pricing',
    },
    icon: <Star className="h-6 w-6" />,
    gradient: 'from-[#FFE66D] to-[#FF6B6B]',
    badge: 'Popular',
  },
  {
    title: 'Salary Calculator',
    description: 'Discover what you should be earning based on your experience, location, and qualifications.',
    cta: {
      label: 'Calculate Now',
      href: '/salary-calculator',
    },
    icon: <Calculator className="h-6 w-6" />,
    gradient: 'from-[#4ECDC4] to-[#5865F2]',
  },
];

export function CTACardsSection({ cards = defaultCards }: CTACardsSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative"
            >
              <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${card.gradient} overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px]" />
                </div>

                {/* Badge */}
                {card.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium backdrop-blur-sm">
                      <Zap className="h-3 w-3" />
                      {card.badge}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 text-white mb-6 backdrop-blur-sm">
                  {card.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-white/90 mb-6 leading-relaxed">
                  {card.description}
                </p>

                {/* CTA */}
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 group/btn"
                >
                  <Link href={card.cta.href}>
                    {card.cta.label}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
