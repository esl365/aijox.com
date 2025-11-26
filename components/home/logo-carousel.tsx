'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import gsap from 'gsap';

interface Logo {
  name: string;
  src: string;
}

interface LogoCarouselProps {
  logos: Logo[];
  speed?: number;
  className?: string;
}

const defaultLogos: Logo[] = [
  { name: 'International School', src: '/logos/school-1.svg' },
  { name: 'British School', src: '/logos/school-2.svg' },
  { name: 'American Academy', src: '/logos/school-3.svg' },
  { name: 'Global Institute', src: '/logos/school-4.svg' },
  { name: 'World School', src: '/logos/school-5.svg' },
];

export function LogoCarousel({
  logos = defaultLogos,
  speed = 30,
  className = '',
}: LogoCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current || !containerRef.current) return;

    const track = trackRef.current;
    const trackWidth = track.scrollWidth / 2;

    // Continuous scrolling animation
    const animation = gsap.to(track, {
      x: -trackWidth,
      duration: speed,
      ease: 'none',
      repeat: -1,
    });

    // Pause on hover
    const container = containerRef.current;
    const handleMouseEnter = () => animation.pause();
    const handleMouseLeave = () => animation.play();

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      animation.kill();
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [speed]);

  // Duplicate logos for seamless loop
  const allLogos = [...logos, ...logos];

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
    >
      {/* Gradient masks */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10" />

        <div ref={trackRef} className="flex gap-12 py-4">
          {allLogos.map((logo, index) => (
            <motion.div
              key={`${logo.name}-${index}`}
              className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-32 h-12 relative flex items-center justify-center">
                {/* Fallback to text if no logo */}
                <span className="text-lg font-semibold text-gray-400">
                  {logo.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
