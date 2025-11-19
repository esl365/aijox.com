/**
 * Error Code System
 * Refinement.md:658-683
 *
 * Standardized error codes for debugging and monitoring
 */

export enum ErrorCode {
  // Authentication & Authorization (AUTH_)
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_ROLE_REQUIRED = 'AUTH_ROLE_REQUIRED',

  // Rate Limiting (RATE_)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  VIDEO_ANALYSIS_RATE_LIMIT = 'VIDEO_ANALYSIS_RATE_LIMIT',
  JOB_MATCHING_RATE_LIMIT = 'JOB_MATCHING_RATE_LIMIT',

  // Video Analysis (VIDEO_)
  VIDEO_ANALYSIS_FAILED = 'VIDEO_ANALYSIS_FAILED',
  VIDEO_ANALYSIS_TIMEOUT = 'VIDEO_ANALYSIS_TIMEOUT',
  VIDEO_ANALYSIS_INVALID_FORMAT = 'VIDEO_ANALYSIS_INVALID_FORMAT',
  VIDEO_ANALYSIS_TOO_LARGE = 'VIDEO_ANALYSIS_TOO_LARGE',
  VIDEO_UPLOAD_FAILED = 'VIDEO_UPLOAD_FAILED',
  VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND',

  // Job Matching (MATCH_)
  MATCH_NO_EMBEDDING = 'MATCH_NO_EMBEDDING',
  MATCH_NO_CANDIDATES = 'MATCH_NO_CANDIDATES',
  MATCH_FILTERING_FAILED = 'MATCH_FILTERING_FAILED',
  MATCH_EMAIL_SEND_FAILED = 'MATCH_EMAIL_SEND_FAILED',

  // Visa Checking (VISA_)
  VISA_INELIGIBLE = 'VISA_INELIGIBLE',
  VISA_CALCULATION_FAILED = 'VISA_CALCULATION_FAILED',
  VISA_CACHE_EXPIRED = 'VISA_CACHE_EXPIRED',
  VISA_REQUIREMENTS_NOT_MET = 'VISA_REQUIREMENTS_NOT_MET',

  // Database (DB_)
  DB_NOT_FOUND = 'DB_NOT_FOUND',
  DB_CONSTRAINT_VIOLATION = 'DB_CONSTRAINT_VIOLATION',
  DB_CONNECTION_FAILED = 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED = 'DB_QUERY_FAILED',

  // Validation (VAL_)
  VAL_INVALID_INPUT = 'VAL_INVALID_INPUT',
  VAL_MISSING_REQUIRED_FIELD = 'VAL_MISSING_REQUIRED_FIELD',
  VAL_SCHEMA_VALIDATION_FAILED = 'VAL_SCHEMA_VALIDATION_FAILED',

  // AI Services (AI_)
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
  AI_INVALID_RESPONSE = 'AI_INVALID_RESPONSE',
  AI_TIMEOUT = 'AI_TIMEOUT',

  // Profile (PROFILE_)
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  PROFILE_INCOMPLETE = 'PROFILE_INCOMPLETE',
  PROFILE_ALREADY_EXISTS = 'PROFILE_ALREADY_EXISTS',

  // General (GEN_)
  GEN_INTERNAL_ERROR = 'GEN_INTERNAL_ERROR',
  GEN_NOT_IMPLEMENTED = 'GEN_NOT_IMPLEMENTED',
  GEN_UNKNOWN_ERROR = 'GEN_UNKNOWN_ERROR',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',       // Informational, doesn't block user
  MEDIUM = 'MEDIUM', // User can retry
  HIGH = 'HIGH',     // Blocks critical functionality
  CRITICAL = 'CRITICAL', // System-wide issue
}

/**
 * Error metadata for logging and monitoring
 */
export interface ErrorMetadata {
  code: ErrorCode;
  severity: ErrorSeverity;
  retryable: boolean;
  category: 'auth' | 'rate-limit' | 'video' | 'matching' | 'visa' | 'database' | 'validation' | 'ai' | 'profile' | 'general';
  httpStatus: number;
}

/**
 * Error code metadata mapping
 */
export const ERROR_METADATA: Record<ErrorCode, ErrorMetadata> = {
  // Authentication
  [ErrorCode.AUTH_UNAUTHORIZED]: {
    code: ErrorCode.AUTH_UNAUTHORIZED,
    severity: ErrorSeverity.HIGH,
    retryable: false,
    category: 'auth',
    httpStatus: 401,
  },
  [ErrorCode.AUTH_FORBIDDEN]: {
    code: ErrorCode.AUTH_FORBIDDEN,
    severity: ErrorSeverity.HIGH,
    retryable: false,
    category: 'auth',
    httpStatus: 403,
  },
  [ErrorCode.AUTH_SESSION_EXPIRED]: {
    code: ErrorCode.AUTH_SESSION_EXPIRED,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    category: 'auth',
    httpStatus: 401,
  },
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: {
    code: ErrorCode.AUTH_INVALID_CREDENTIALS,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    category: 'auth',
    httpStatus: 401,
  },
  [ErrorCode.AUTH_ROLE_REQUIRED]: {
    code: ErrorCode.AUTH_ROLE_REQUIRED,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    category: 'auth',
    httpStatus: 403,
  },

  // Rate Limiting
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    category: 'rate-limit',
    httpStatus: 429,
  },
  [ErrorCode.VIDEO_ANALYSIS_RATE_LIMIT]: {
    code: ErrorCode.VIDEO_ANALYSIS_RATE_LIMIT,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    category: 'rate-limit',
    httpStatus: 429,
  },
  [ErrorCode.JOB_MATCHING_RATE_LIMIT]: {
    code: ErrorCode.JOB_MATCHING_RATE_LIMIT,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    category: 'rate-limit',
    httpStatus: 429,
  },

  // Video Analysis
  [ErrorCode.VIDEO_ANALYSIS_FAILED]: {
    code: ErrorCode.VIDEO_ANALYSIS_FAILED,
    severity: ErrorSeverity.HIGH,
    retryable: true,
    category: 'video',
    httpStatus: 500,
  },
  [ErrorCode.VIDEO_ANALYSIS_TIMEOUT]: {
    code: ErrorCode.VIDEO_ANALYSIS_TIMEOUT,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    category: 'video',
    httpStatus: 504,
  },
  [ErrorCode.VIDEO_ANALYSIS_INVALID_FORMAT]: {
    code: ErrorCode.VIDEO_ANALYSIS_INVALID_FORMAT,
    severity: ErrorSeverity.LOW,
    retryable: false,
    category: 'video',
    httpStatus: 400,
  },
  [ErrorCode.VIDEO_ANALYSIS_TOO_LARGE]: {
    code: ErrorCode.VIDEO_ANALYSIS_TOO_LARGE,
    severity: ErrorSeverity.LOW,
    retryable: false,
    category: 'video',
    httpStatus: 413,
  },
  [ErrorCode.VIDEO_UPLOAD_FAILED]: {
    code: ErrorCode.VIDEO_UPLOAD_FAILED,
    severity: ErrorSeverity.HIGH,
    retryable: true,
    category: 'video',
    httpStatus: 500,
  },
  [ErrorCode.VIDEO_NOT_FOUND]: {
    code: ErrorCode.VIDEO_NOT_FOUND,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    category: 'video',
    httpStatus: 404,
  },

  // Job Matching
  [ErrorCode.MATCH_NO_EMBEDDING]: {
    code: ErrorCode.MATCH_NO_EMBEDDING,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    category: 'matching',
    httpStatus: 400,
  },
  [ErrorCode.MATCH_NO_CANDIDATES]: {
    code: ErrorCode.MATCH_NO_CANDIDATES,
    severity: ErrorSeverity.LOW,
    retryable: false,
    category: 'matching',
    httpStatus: 404,
  },
  [ErrorCode.MATCH_FILTERING_FAILED]: {
    code: ErrorCode.MATCH_FILTERING_FAILED,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    category: 'matching',
    httpStatus: 500,
  },
  [ErrorCode.MATCH_EMAIL_SEND_FAILED]: {
    code: ErrorCode.MATCH_EMAIL_SEND_FAILED,
    severity: ErrorSeverity.HIGH,
    retryable: true,
    category: 'matching',
    httpStatus: 500,
  },

  // Visa
  [ErrorCode.VISA_INELIGIBLE]: {
    code: ErrorCode.VISA_INELIGIBLE,
    severity: ErrorSeverity.LOW,
    retryable: false,
    category: 'visa',
    httpStatus: 400,
  },
  [ErrorCode.VISA_CALCULATION_FAILED]: {
    code: ErrorCode.VISA_CALCULATION_FAILED,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    category: 'visa',
    httpStatus: 500,
  },
  [ErrorCode.VISA_CACHE_EXPIRED]: {
    code: ErrorCode.VISA_CACHE_EXPIRED,
    severity: ErrorSeverity.LOW,
    retryable: true,
    category: 'visa',
    httpStatus: 200,
  },
  [ErrorCode.VISA_REQUIREMENTS_NOT_MET]: {
    code: ErrorCode.VISA_REQUIREMENTS_NOT_MET,
    severity: ErrorSeverity.LOW,
    retryable: false,
    category: 'visa',
    httpStatus: 400,
  },

  // Database
  [ErrorCode.DB_NOT_FOUND]: {
    code: ErrorCode.DB_NOT_FOUND,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    category: 'database',
    httpStatus: 404,
  },
  [ErrorCode.DB_CONSTRAINT_VIOLATION]: {
    code: ErrorCode.DB_CONSTRAINT_VIOLATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    category: 'database',
    httpStatus: 409,
  },
  [ErrorCode.DB_CONNECTION_FAILED]: {
    code: ErrorCode.DB_CONNECTION_FAILED,
    severity: ErrorSeverity.CRITICAL,
    retryable: true,
    category: 'database',
    httpStatus: 503,
  },
  [ErrorCode.DB_QUERY_FAILED]: {
    code: ErrorCode.DB_QUERY_FAILED,
    severity: ErrorSeverity.HIGH,
    retryable: true,
    category: 'database',
    httpStatus: 500,
  },

  // Validation
  [ErrorCode.VAL_INVALID_INPUT]: {
    code: ErrorCode.VAL_INVALID_INPUT,
    severity: ErrorSeverity.LOW,
    retryable: false,
    category: 'validation',
    httpStatus: 400,
  },
  [ErrorCode.VAL_MISSING_REQUIRED_FIELD]: {
    code: ErrorCode.VAL_MISSING_REQUIRED_FIELD,
    severity: ErrorSeverity.LOW,
    retryable: false,
    category: 'validation',
    httpStatus: 400,
  },
  [ErrorCode.VAL_SCHEMA_VALIDATION_FAILED]: {
    code: ErrorCode.VAL_SCHEMA_VALIDATION_FAILED,
    severity: ErrorSeverity.LOW,
    retryable: false,
    category: 'validation',
    httpStatus: 400,
  },

  // AI Services
  [ErrorCode.AI_SERVICE_UNAVAILABLE]: {
    code: ErrorCode.AI_SERVICE_UNAVAILABLE,
    severity: ErrorSeverity.HIGH,
    retryable: true,
    category: 'ai',
    httpStatus: 503,
  },
  [ErrorCode.AI_QUOTA_EXCEEDED]: {
    code: ErrorCode.AI_QUOTA_EXCEEDED,
    severity: ErrorSeverity.HIGH,
    retryable: false,
    category: 'ai',
    httpStatus: 429,
  },
  [ErrorCode.AI_INVALID_RESPONSE]: {
    code: ErrorCode.AI_INVALID_RESPONSE,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    category: 'ai',
    httpStatus: 500,
  },
  [ErrorCode.AI_TIMEOUT]: {
    code: ErrorCode.AI_TIMEOUT,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    category: 'ai',
    httpStatus: 504,
  },

  // Profile
  [ErrorCode.PROFILE_NOT_FOUND]: {
    code: ErrorCode.PROFILE_NOT_FOUND,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    category: 'profile',
    httpStatus: 404,
  },
  [ErrorCode.PROFILE_INCOMPLETE]: {
    code: ErrorCode.PROFILE_INCOMPLETE,
    severity: ErrorSeverity.LOW,
    retryable: false,
    category: 'profile',
    httpStatus: 400,
  },
  [ErrorCode.PROFILE_ALREADY_EXISTS]: {
    code: ErrorCode.PROFILE_ALREADY_EXISTS,
    severity: ErrorSeverity.LOW,
    retryable: false,
    category: 'profile',
    httpStatus: 409,
  },

  // General
  [ErrorCode.GEN_INTERNAL_ERROR]: {
    code: ErrorCode.GEN_INTERNAL_ERROR,
    severity: ErrorSeverity.CRITICAL,
    retryable: true,
    category: 'general',
    httpStatus: 500,
  },
  [ErrorCode.GEN_NOT_IMPLEMENTED]: {
    code: ErrorCode.GEN_NOT_IMPLEMENTED,
    severity: ErrorSeverity.LOW,
    retryable: false,
    category: 'general',
    httpStatus: 501,
  },
  [ErrorCode.GEN_UNKNOWN_ERROR]: {
    code: ErrorCode.GEN_UNKNOWN_ERROR,
    severity: ErrorSeverity.HIGH,
    retryable: true,
    category: 'general',
    httpStatus: 500,
  },
};
