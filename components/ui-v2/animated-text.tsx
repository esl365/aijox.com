'use client';

/**
 * AnimatedText Component
 *
 * Text animation component using GSAP with accessibility support.
 * Supports multiple animation types and respects prefers-reduced-motion.
 *
 * Usage:
 * <AnimatedText text="Welcome to Global Educator Nexus" animation="wordByWord" />
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { shouldReduceMotion } from '@/lib/design-system';
import type { AnimatedTextProps } from '@/lib/design-system';
import { cn } from '@/lib/utils';

export function AnimatedText({
  text,
  animation = 'slideUp',
  stagger = 0.03,
  delay = 0,
  as: Component = 'p',
  className,
  ...props
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current || shouldReduceMotion()) {
      return;
    }

    const ctx = gsap.context(() => {
      switch (animation) {
        case 'wordByWord': {
          const words = containerRef.current?.querySelectorAll('.word');
          if (words) {
            gsap.fromTo(
              words,
              {
                y: 40,
                opacity: 0,
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: stagger,
                delay: delay,
                ease: 'power3.out',
              }
            );
          }
          break;
        }

        case 'slideUp': {
          gsap.fromTo(
            containerRef.current,
            {
              y: 40,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              delay: delay,
              ease: 'power3.out',
            }
          );
          break;
        }

        case 'fadeIn': {
          gsap.fromTo(
            containerRef.current,
            {
              opacity: 0,
            },
            {
              opacity: 1,
              duration: 0.6,
              delay: delay,
              ease: 'power2.out',
            }
          );
          break;
        }

        case 'scaleIn': {
          gsap.fromTo(
            containerRef.current,
            {
              scale: 0.8,
              opacity: 0,
            },
            {
              scale: 1,
              opacity: 1,
              duration: 0.6,
              delay: delay,
              ease: 'back.out(1.4)',
            }
          );
          break;
        }
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [text, animation, stagger, delay]);

  // Split text into words for word-by-word animation
  const renderContent = () => {
    if (animation === 'wordByWord') {
      return text.split(' ').map((word, index) => (
        <span
          key={index}
          className="word inline-block"
          style={{
            marginRight: '0.25em',
            opacity: shouldReduceMotion() ? 1 : 0,
          }}
        >
          {word}
        </span>
      ));
    }

    return text;
  };

  return (
    <Component
      ref={containerRef as any}
      className={cn('animated-text', className)}
      style={{
        opacity: shouldReduceMotion() ? 1 : 0,
      }}
      {...props}
    >
      {renderContent()}
    </Component>
  );
}

/**
 * AnimatedCounter Component
 *
 * Animated number counter for metrics and statistics.
 */
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 2,
  suffix = '',
  prefix = '',
  className,
  decimals = 0,
}: AnimatedCounterProps) {
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!counterRef.current || shouldReduceMotion()) {
      if (counterRef.current) {
        counterRef.current.textContent = `${prefix}${value.toLocaleString()}${suffix}`;
      }
      return;
    }

    const counter = { value: 0 };

    const ctx = gsap.context(() => {
      gsap.to(counter, {
        value: value,
        duration: duration,
        ease: 'power2.out',
        onUpdate: () => {
          if (counterRef.current) {
            const displayValue = decimals > 0
              ? counter.value.toFixed(decimals)
              : Math.floor(counter.value).toLocaleString();
            counterRef.current.textContent = `${prefix}${displayValue}${suffix}`;
          }
        },
      });
    });

    return () => {
      ctx.revert();
    };
  }, [value, duration, suffix, prefix, decimals]);

  return (
    <span ref={counterRef} className={className}>
      {`${prefix}0${suffix}`}
    </span>
  );
}
