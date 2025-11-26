'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

interface FloatingTag {
  label: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface FloatingTagsProps {
  tags: FloatingTag[];
  className?: string;
}

const defaultTags: FloatingTag[] = [
  { label: 'TEFL Certified', color: '#FF6B6B', size: 'lg' },
  { label: 'Native Speaker', color: '#4ECDC4', size: 'md' },
  { label: 'K-12 Experience', color: '#5865F2', size: 'lg' },
  { label: 'IB Curriculum', color: '#FFE66D', size: 'sm' },
  { label: 'STEM Teacher', color: '#95E1D3', size: 'md' },
  { label: 'ESL Expert', color: '#F38181', size: 'sm' },
  { label: 'Early Childhood', color: '#AA96DA', size: 'md' },
  { label: 'Remote Ready', color: '#91C788', size: 'lg' },
];

export function FloatingTags({ tags = defaultTags, className = '' }: FloatingTagsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tagElements = containerRef.current.querySelectorAll('.floating-tag');

    tagElements.forEach((tag, index) => {
      // Random starting position within bounds
      const randomX = Math.random() * 100 - 50;
      const randomY = Math.random() * 60 - 30;

      gsap.set(tag, {
        x: randomX,
        y: randomY,
      });

      // Continuous floating animation
      gsap.to(tag, {
        x: `+=${Math.random() * 40 - 20}`,
        y: `+=${Math.random() * 30 - 15}`,
        duration: 3 + Math.random() * 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: index * 0.2,
      });

      // Subtle rotation
      gsap.to(tag, {
        rotation: Math.random() * 10 - 5,
        duration: 4 + Math.random() * 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    });

    return () => {
      tagElements.forEach((tag) => {
        gsap.killTweensOf(tag);
      });
    };
  }, []);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  // Position tags in specific areas
  const positions = [
    { top: '10%', left: '5%' },
    { top: '25%', right: '8%' },
    { top: '45%', left: '3%' },
    { top: '60%', right: '5%' },
    { top: '15%', left: '85%' },
    { top: '70%', left: '10%' },
    { top: '35%', right: '3%' },
    { top: '80%', right: '15%' },
  ];

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {tags.slice(0, 8).map((tag, index) => (
        <motion.div
          key={tag.label}
          className="floating-tag absolute"
          style={{
            ...positions[index % positions.length],
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <span
            className={`inline-block rounded-full font-medium shadow-lg backdrop-blur-sm ${sizeClasses[tag.size || 'md']}`}
            style={{
              backgroundColor: `${tag.color}20`,
              color: tag.color,
              border: `1px solid ${tag.color}40`,
            }}
          >
            {tag.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
