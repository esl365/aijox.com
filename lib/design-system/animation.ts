/**
 * Animation Utilities
 *
 * GSAP and Framer Motion presets for consistent animations.
 * Supports prefers-reduced-motion for accessibility.
 *
 * Usage:
 * import { animationPresets, shouldReduceMotion } from '@/lib/design-system/animation';
 */

import { designTokens } from './tokens';

/**
 * Check if user prefers reduced motion
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * GSAP Animation Presets
 */
export const gsapPresets = {
  /**
   * Fade animations
   */
  fadeIn: {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out',
  },
  fadeOut: {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in',
  },

  /**
   * Slide animations
   */
  slideUp: {
    y: 40,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out',
  },
  slideDown: {
    y: -40,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out',
  },
  slideLeft: {
    x: 40,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out',
  },
  slideRight: {
    x: -40,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out',
  },

  /**
   * Scale animations
   */
  scaleIn: {
    scale: 0.8,
    opacity: 0,
    duration: 0.5,
    ease: 'back.out(1.7)',
  },
  scaleOut: {
    scale: 0.8,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in',
  },

  /**
   * Stagger configurations
   */
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.2,
  },

  /**
   * Hero section animations
   */
  hero: {
    headline: {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.03, // Per word
    },
    subheadline: {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.3,
    },
    cta: {
      y: 20,
      opacity: 0,
      scale: 0.95,
      duration: 0.6,
      ease: 'back.out(1.4)',
      delay: 0.6,
    },
    metrics: {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.1,
      delay: 0.8,
    },
  },

  /**
   * Job card animations
   */
  jobCard: {
    hover: {
      y: -4,
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      duration: 0.3,
      ease: 'power2.out',
    },
    initial: {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    },
  },

  /**
   * Modal animations
   */
  modal: {
    backdrop: {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
    },
    content: {
      y: 20,
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      ease: 'back.out(1.5)',
    },
  },

  /**
   * Navigation animations
   */
  navigation: {
    mobileMenu: {
      x: -300,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
    },
    dropdown: {
      y: -10,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
    },
  },
} as const;

/**
 * Framer Motion Variants
 */
export const motionVariants = {
  /**
   * Fade variants
   */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: parseFloat(designTokens.transitions.duration.base) / 1000,
    },
  },

  /**
   * Slide up variant
   */
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 1, 1],
      },
    },
  },

  /**
   * Scale variant
   */
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  },

  /**
   * Stagger children variant
   */
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  /**
   * List item variant (for stagger)
   */
  listItem: {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  },

  /**
   * Hover animations
   */
  hover: {
    scale: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
      transition: { duration: 0.2 },
    },
    lift: {
      whileHover: { y: -4 },
      transition: { duration: 0.2 },
    },
  },
} as const;

/**
 * Spring configurations for Framer Motion
 */
export const springConfigs = {
  gentle: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 14,
  },
  wobbly: {
    type: 'spring' as const,
    stiffness: 180,
    damping: 12,
  },
  stiff: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  },
  slow: {
    type: 'spring' as const,
    stiffness: 60,
    damping: 15,
  },
} as const;

/**
 * Keyframe animations for CSS
 */
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  slideDown: `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  scaleIn: `
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,
} as const;

/**
 * Animation duration helper
 */
export const getAnimationDuration = (
  speed: 'fast' | 'base' | 'slow' | 'slower' = 'base'
): number => {
  return parseFloat(designTokens.transitions.duration[speed]) / 1000;
};

/**
 * Get safe animation config (respects prefers-reduced-motion)
 */
export const getSafeAnimation = <T extends Record<string, any>>(
  animation: T
): T | Record<string, never> => {
  if (shouldReduceMotion()) {
    return {} as Record<string, never>;
  }
  return animation;
};

/**
 * Create GSAP timeline with reduced motion support
 */
export const createTimeline = () => {
  if (shouldReduceMotion()) {
    return null;
  }

  // Return timeline factory
  // Actual GSAP timeline will be created in components
  return {
    duration: 0,
    delay: 0,
    ease: 'none',
  };
};

/**
 * Transition presets for common patterns
 */
export const transitionPresets = {
  default: `all ${designTokens.transitions.duration.base} ${designTokens.transitions.easing.smooth}`,
  fast: `all ${designTokens.transitions.duration.fast} ${designTokens.transitions.easing.smooth}`,
  slow: `all ${designTokens.transitions.duration.slow} ${designTokens.transitions.easing.smooth}`,
  opacity: `opacity ${designTokens.transitions.duration.base} ${designTokens.transitions.easing.smooth}`,
  transform: `transform ${designTokens.transitions.duration.base} ${designTokens.transitions.easing.emphasized}`,
  colors: `background-color ${designTokens.transitions.duration.base} ${designTokens.transitions.easing.smooth}, color ${designTokens.transitions.duration.base} ${designTokens.transitions.easing.smooth}`,
} as const;

/**
 * Type exports
 */
export type AnimationSpeed = 'fast' | 'base' | 'slow' | 'slower';
export type SpringConfig = keyof typeof springConfigs;
export type TransitionPreset = keyof typeof transitionPresets;
