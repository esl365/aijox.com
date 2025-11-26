/**
 * Application-wide Configuration
 *
 * Central configuration file for all application constants and settings
 */

export const APP_CONFIG = {
  /**
   * Application Metadata
   */
  APP: {
    NAME: 'Global Educator Nexus',
    DESCRIPTION: 'AI-powered platform connecting international educators with teaching opportunities',
    URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    VERSION: '1.0.0',
  },

  /**
   * Feature Flags
   */
  FEATURES: {
    VIDEO_RESUME: process.env.NEXT_PUBLIC_ENABLE_VIDEO_RESUME === 'true',
    AI_MATCHING: process.env.NEXT_PUBLIC_ENABLE_AI_MATCHING === 'true',
    ANONYMOUS_JOBS: process.env.NEXT_PUBLIC_ENABLE_ANONYMOUS_JOBS === 'true',
    MAP_VIEW: true, // Phase 1.1 feature
    PWA: true, // Progressive Web App enabled
  },

  /**
   * Pagination Defaults
   */
  PAGINATION: {
    JOBS_PER_PAGE: 12,
    TEACHERS_PER_PAGE: 20,
    APPLICATIONS_PER_PAGE: 25,
    NOTIFICATIONS_PER_PAGE: 50,
  },

  /**
   * Upload Limits
   */
  UPLOADS: {
    VIDEO: {
      MAX_SIZE_MB: 100,
      MAX_SIZE_BYTES: 100 * 1024 * 1024,
      MAX_DURATION_SECONDS: 300, // 5 minutes
      ALLOWED_TYPES: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'],
    },
    IMAGE: {
      MAX_SIZE_MB: 5,
      MAX_SIZE_BYTES: 5 * 1024 * 1024,
      ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    },
    DOCUMENT: {
      MAX_SIZE_MB: 10,
      MAX_SIZE_BYTES: 10 * 1024 * 1024,
      ALLOWED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    },
  },

  /**
   * Session & Authentication
   */
  AUTH: {
    SESSION_MAX_AGE_DAYS: 30,
    SESSION_MAX_AGE_SECONDS: 30 * 24 * 60 * 60,
    REMEMBER_ME_MAX_AGE_DAYS: 90,
  },

  /**
   * Email Configuration
   */
  EMAIL: {
    FROM_ADDRESS: process.env.FROM_EMAIL || 'jobs@globalteaching.com',
    REPLY_TO: 'support@globalteaching.com',
    SUPPORT_EMAIL: 'support@globalteaching.com',

    // Email batch processing
    BATCH_SIZE: 50,
    BATCH_DELAY_MS: 1000, // 1 second between batches
  },

  /**
   * AI Service Configuration
   */
  AI: {
    // Model selections
    MODELS: {
      VIDEO_ANALYSIS: 'gpt-4o',
      EMBEDDINGS: 'text-embedding-3-small',
      EMAIL_GENERATION: 'claude-3-5-sonnet-20241022',
    },

    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 2000,

    // Timeout configuration (in milliseconds)
    TIMEOUTS: {
      VIDEO_ANALYSIS: 120000, // 2 minutes
      EMBEDDING: 10000, // 10 seconds
      EMAIL_GENERATION: 30000, // 30 seconds
    },

    // Cost quotas (per user per month in USD)
    QUOTAS: {
      FREE_TIER: 10.00,
      PREMIUM_TIER: 100.00,
      ENTERPRISE_TIER: 1000.00,
    },
  },

  /**
   * Cache Configuration
   */
  CACHE: {
    // TTL values in seconds
    TTL: {
      MATCH_RESULTS: 3600, // 1 hour
      VISA_STATUS: 30 * 24 * 60 * 60, // 30 days
      JOB_LISTINGS: 300, // 5 minutes
      PROFILE_DATA: 600, // 10 minutes
    },

    // Cache invalidation
    INVALIDATE_ON: {
      PROFILE_UPDATE: true,
      JOB_POST: true,
      APPLICATION_SUBMIT: true,
    },
  },

  /**
   * Search Configuration
   */
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_RESULTS: 100,
    DEBOUNCE_MS: 300,

    // Facet limits
    MAX_FACETS: {
      COUNTRIES: 20,
      SUBJECTS: 30,
      GRADE_LEVELS: 10,
    },
  },

  /**
   * Map View Configuration (Phase 1.1)
   */
  MAP: {
    DEFAULT_CENTER: {
      LAT: 35.0, // Center on Asia
      LNG: 105.0,
    },
    DEFAULT_ZOOM: 4,
    MAX_MARKERS: 500,
    CLUSTER_RADIUS: 60,

    // Geocoding
    GEOCODING: {
      CACHE_DURATION_DAYS: 365, // Cache geocode results for 1 year
      BATCH_SIZE: 10,
      BATCH_DELAY_MS: 1000,
    },
  },

  /**
   * Monitoring & Analytics
   */
  MONITORING: {
    // Sentry DSN (if configured)
    SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Analytics
    ENABLE_ANALYTICS: process.env.NODE_ENV === 'production',

    // Performance thresholds
    THRESHOLDS: {
      LCP_MS: 2500, // Largest Contentful Paint
      FID_MS: 100, // First Input Delay
      CLS: 0.1, // Cumulative Layout Shift
    },
  },

  /**
   * Rate Limiting (when Redis is available)
   */
  RATE_LIMITS: {
    ENABLED: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),

    // Limits per time window
    VIDEO_ANALYSIS: { requests: 5, windowMs: 3600000 }, // 5 per hour
    EMAIL_GENERATION: { requests: 20, windowMs: 600000 }, // 20 per 10 minutes
    JOB_MATCHING: { requests: 10, windowMs: 60000 }, // 10 per minute
    API_PUBLIC: { requests: 100, windowMs: 60000 }, // 100 per minute
    SERVER_ACTION: { requests: 100, windowMs: 60000 }, // 100 per minute
  },

  /**
   * Job Posting Configuration
   */
  JOBS: {
    // Auto-expire job postings after X days
    AUTO_EXPIRE_DAYS: 90,

    // Featured job settings
    FEATURED_DURATION_DAYS: 30,
    FEATURED_BOOST_MULTIPLIER: 2.0,

    // Application limits
    MAX_APPLICATIONS_PER_JOB: 1000,
    MIN_SALARY_USD: 1000,
    MAX_SALARY_USD: 20000,
  },

  /**
   * Supported Countries & Subjects
   */
  OPTIONS: {
    COUNTRIES: [
      'South Korea', 'China', 'Japan', 'Taiwan', 'Thailand',
      'Vietnam', 'UAE', 'Saudi Arabia', 'Qatar', 'Singapore',
    ],

    SUBJECTS: [
      'English (ESL/EFL)', 'Math', 'Science', 'Social Studies',
      'Computer Science', 'Art', 'Music', 'Physical Education',
      'Special Education', 'Early Childhood', 'IB Program',
    ],

    GRADE_LEVELS: [
      'Preschool', 'Elementary (K-5)', 'Middle School (6-8)',
      'High School (9-12)', 'University', 'Adult Education',
    ],
  },
} as const;

/**
 * Environment-specific settings
 */
export const ENV = {
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;

/**
 * Helper to check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof APP_CONFIG.FEATURES): boolean {
  return APP_CONFIG.FEATURES[feature] === true;
}

/**
 * Helper to get rate limit config
 */
export function getRateLimit(operation: keyof typeof APP_CONFIG.RATE_LIMITS) {
  if (operation === 'ENABLED') return APP_CONFIG.RATE_LIMITS.ENABLED;
  return APP_CONFIG.RATE_LIMITS[operation];
}

/**
 * Type exports
 */
export type AppConfig = typeof APP_CONFIG;
export type FeatureFlag = keyof typeof APP_CONFIG.FEATURES;
