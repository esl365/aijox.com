'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;

      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const tick = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (duration * 1000), 1);

        // Easing function (easeOutExpo)
        const easeProgress = 1 - Math.pow(2, -10 * progress);
        const currentValue = Math.round(easeProgress * value);

        setDisplayValue(currentValue);

        if (now < endTime) {
          requestAnimationFrame(tick);
        } else {
          setDisplayValue(value);
        }
      };

      requestAnimationFrame(tick);
    }
  }, [isInView, value, duration]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <motion.span
      ref={ref}
      className={`tabular-nums ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </motion.span>
  );
}
