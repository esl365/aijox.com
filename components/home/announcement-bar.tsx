'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnnouncementBarProps {
  message: string;
  linkText?: string;
  linkHref?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  variant?: 'default' | 'gradient' | 'dark';
}

export function AnnouncementBar({
  message,
  linkText = 'Learn more',
  linkHref = '#',
  icon = <Sparkles className="h-4 w-4" />,
  dismissible = true,
  variant = 'gradient',
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const variants = {
    default: 'bg-primary text-primary-foreground',
    gradient: 'bg-gradient-to-r from-[#5865F2] via-[#FF6B6B] to-[#4ECDC4] text-white',
    dark: 'bg-gray-900 text-white',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`relative overflow-hidden ${variants[variant]}`}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 py-2.5 text-sm">
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                {icon}
              </motion.span>
              <span className="font-medium">{message}</span>
              {linkHref && linkText && (
                <Link
                  href={linkHref}
                  className="ml-1 inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:no-underline transition-all"
                >
                  {linkText}
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Link>
              )}
              {dismissible && (
                <button
                  onClick={() => setIsVisible(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Dismiss announcement"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
