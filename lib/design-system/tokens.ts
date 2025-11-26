/**
 * Design Token System
 *
 * Centralized design tokens for the Global Educator Nexus platform.
 * Based on Wellfound benchmark analysis and tailored for dual-audience (teachers/recruiters).
 *
 * Usage:
 * import { designTokens } from '@/lib/design-system/tokens';
 * const color = designTokens.colors.brand.primary[500];
 */

export const designTokens = {
  /**
   * Color System
   * Primary: Brand identity
   * Semantic: Contextual colors (success, warning, error, info)
   * Neutral: Grays for text and backgrounds
   * Role: Teacher (teal) and Recruiter (purple) specific colors
   */
  colors: {
    brand: {
      primary: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6', // Main brand color
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
        950: '#172554',
      },
      secondary: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
      },
    },
    semantic: {
      success: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        500: '#10B981', // Main success color
        600: '#059669',
        700: '#047857',
      },
      warning: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        500: '#F59E0B', // Main warning color
        600: '#D97706',
        700: '#B45309',
      },
      error: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        500: '#EF4444', // Main error color
        600: '#DC2626',
        700: '#B91C1C',
      },
      info: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        500: '#3B82F6', // Main info color
        600: '#2563EB',
        700: '#1D4ED8',
      },
    },
    neutral: {
      white: '#FFFFFF',
      black: '#000000',
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      950: '#030712',
    },
    role: {
      teacher: {
        50: '#F0FDFA',
        100: '#CCFBF1',
        500: '#14B8A6', // Teal for teachers
        600: '#0D9488',
        700: '#0F766E',
      },
      recruiter: {
        50: '#FAF5FF',
        100: '#F3E8FF',
        500: '#A855F7', // Purple for recruiters
        600: '#9333EA',
        700: '#7E22CE',
      },
    },
    functional: {
      visa: {
        available: '#10B981', // Green
        conditional: '#F59E0B', // Amber
        unavailable: '#EF4444', // Red
      },
      badge: {
        featured: '#F59E0B', // Amber
        urgent: '#EF4444', // Red
        new: '#3B82F6', // Blue
      },
    },
  },

  /**
   * Typography System
   * Font families, sizes, weights, and line heights
   */
  typography: {
    fontFamily: {
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'sans-serif',
      ].join(', '),
      mono: [
        'JetBrains Mono',
        'Menlo',
        'Monaco',
        'Courier New',
        'monospace',
      ].join(', '),
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
      base: ['1rem', { lineHeight: '1.5rem' }], // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
      '5xl': ['3rem', { lineHeight: '1' }], // 48px
      '6xl': ['3.75rem', { lineHeight: '1' }], // 60px
      '7xl': ['4.5rem', { lineHeight: '1' }], // 72px
      '8xl': ['6rem', { lineHeight: '1' }], // 96px
      '9xl': ['8rem', { lineHeight: '1' }], // 128px
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  /**
   * Spacing System
   * Based on 4px base unit (0.25rem)
   */
  spacing: {
    0: '0px',
    px: '1px',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem', // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem', // 12px
    3.5: '0.875rem', // 14px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    7: '1.75rem', // 28px
    8: '2rem', // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
    11: '2.75rem', // 44px - WCAG touch target minimum
    12: '3rem', // 48px
    14: '3.5rem', // 56px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    28: '7rem', // 112px
    32: '8rem', // 128px
    36: '9rem', // 144px
    40: '10rem', // 160px
    44: '11rem', // 176px
    48: '12rem', // 192px
    52: '13rem', // 208px
    56: '14rem', // 224px
    60: '15rem', // 240px
    64: '16rem', // 256px
    72: '18rem', // 288px
    80: '20rem', // 320px
    96: '24rem', // 384px
  },

  /**
   * Border Radius System
   */
  borderRadius: {
    none: '0px',
    sm: '0.125rem', // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  /**
   * Shadow System
   * Based on elevation levels
   */
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
  },

  /**
   * Z-Index System
   * Layering hierarchy
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },

  /**
   * Breakpoints
   * Mobile-first responsive design
   */
  breakpoints: {
    xs: '375px', // iPhone SE
    sm: '640px', // Small tablets
    md: '768px', // Tablets
    lg: '1024px', // Desktop
    xl: '1280px', // Large desktop
    '2xl': '1536px', // Extra large desktop
  },

  /**
   * Animation Timing Functions
   */
  transitions: {
    duration: {
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      // Custom easing functions
      smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      emphasized: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  /**
   * Layout Constraints
   */
  layout: {
    maxWidth: {
      xs: '20rem', // 320px
      sm: '24rem', // 384px
      md: '28rem', // 448px
      lg: '32rem', // 512px
      xl: '36rem', // 576px
      '2xl': '42rem', // 672px
      '3xl': '48rem', // 768px
      '4xl': '56rem', // 896px
      '5xl': '64rem', // 1024px
      '6xl': '72rem', // 1152px
      '7xl': '80rem', // 1280px
      full: '100%',
      prose: '65ch',
    },
    container: {
      padding: {
        DEFAULT: '1rem', // 16px
        sm: '2rem', // 32px
        lg: '4rem', // 64px
        xl: '5rem', // 80px
      },
    },
  },

  /**
   * Accessibility
   * WCAG 2.1 AA compliance standards
   */
  accessibility: {
    touchTarget: {
      minimum: '44px', // WCAG 2.5.5
      comfortable: '48px',
    },
    colorContrast: {
      textNormal: 4.5, // Minimum ratio
      textLarge: 3.0, // Large text (18pt+)
      ui: 3.0, // UI components
    },
    focusRing: {
      width: '2px',
      offset: '2px',
      color: '#3B82F6',
    },
  },
} as const;

/**
 * Type definitions for design tokens
 */
export type DesignTokens = typeof designTokens;
export type ColorScale = typeof designTokens.colors.brand.primary;
export type Spacing = keyof typeof designTokens.spacing;
export type FontSize = keyof typeof designTokens.typography.fontSize;
export type FontWeight = keyof typeof designTokens.typography.fontWeight;
export type BorderRadius = keyof typeof designTokens.borderRadius;
export type BoxShadow = keyof typeof designTokens.boxShadow;
export type ZIndex = keyof typeof designTokens.zIndex;
export type Breakpoint = keyof typeof designTokens.breakpoints;

/**
 * Helper functions
 */
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = designTokens.colors;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color path "${path}" not found in design tokens`);
      return '#000000';
    }
  }

  return value;
};

export const getSpacing = (key: Spacing): string => {
  return designTokens.spacing[key];
};

export const getFontSize = (key: FontSize): [string, { lineHeight: string }] => {
  return designTokens.typography.fontSize[key] as [string, { lineHeight: string }];
};
