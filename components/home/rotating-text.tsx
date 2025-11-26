'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RotatingTextProps {
  words: string[];
  interval?: number;
  className?: string;
}

export function RotatingText({
  words,
  interval = 3000,
  className = '',
}: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className={`inline-block relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: 40, opacity: 0, rotateX: -90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -40, opacity: 0, rotateX: 90 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="inline-block bg-gradient-to-r from-[#5865F2] via-[#FF6B6B] to-[#4ECDC4] bg-clip-text text-transparent"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
