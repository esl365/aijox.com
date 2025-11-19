/**
 * Application Error Class
 * Refinement.md:658-683
 *
 * Standardized error handling with error codes
 */

import { ErrorCode, ERROR_METADATA, ErrorSeverity } from './codes';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly severity: ErrorSeverity;
  public readonly retryable: boolean;
  public readonly httpStatus: number;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    userMessage: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.timestamp = new Date();
    this.context = context;

    // Get metadata from error code
    const metadata = ERROR_METADATA[code];
    this.severity = metadata.severity;
    this.retryable = metadata.retryable;
    this.httpStatus = metadata.httpStatus;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      code: this.code,
      message: this.userMessage,
      severity: this.severity,
      retryable: this.retryable,
      timestamp: this.timestamp.toISOString(),
      ...(this.context && { context: this.context }),
    };
  }

  /**
   * Convert error to log format
   */
  toLogFormat() {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      severity: this.severity,
      retryable: this.retryable,
      httpStatus: this.httpStatus,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      ...(this.context && { context: this.context }),
    };
  }

  /**
   * Factory methods for common errors
   */

  static unauthorized(message = 'Unauthorized access', userMessage = 'Please sign in to continue') {
    return new AppError(ErrorCode.AUTH_UNAUTHORIZED, message, userMessage);
  }

  static forbidden(message = 'Forbidden', userMessage = 'You do not have permission to perform this action') {
    return new AppError(ErrorCode.AUTH_FORBIDDEN, message, userMessage);
  }

  static rateLimitExceeded(userMessage: string, retryAfter?: number) {
    return new AppError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Rate limit exceeded',
      userMessage,
      retryAfter ? { retryAfter } : undefined
    );
  }

  static notFound(resource: string, userMessage?: string) {
    return new AppError(
      ErrorCode.DB_NOT_FOUND,
      `${resource} not found`,
      userMessage || `The requested ${resource.toLowerCase()} could not be found`
    );
  }

  static validationError(message: string, userMessage: string, details?: unknown) {
    return new AppError(
      ErrorCode.VAL_INVALID_INPUT,
      message,
      userMessage,
      details ? { validationErrors: details } : undefined
    );
  }

  static internalError(message = 'Internal server error', userMessage = 'An unexpected error occurred. Please try again later') {
    return new AppError(ErrorCode.GEN_INTERNAL_ERROR, message, userMessage);
  }

  /**
   * Create AppError from unknown error
   */
  static fromUnknown(error: unknown, fallbackMessage = 'An unexpected error occurred'): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(
        ErrorCode.GEN_UNKNOWN_ERROR,
        error.message,
        fallbackMessage,
        { originalError: error.name }
      );
    }

    return new AppError(
      ErrorCode.GEN_UNKNOWN_ERROR,
      String(error),
      fallbackMessage
    );
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.retryable;
    }
    return false;
  }

  /**
   * Get user-friendly message from any error
   */
  static getUserMessage(error: unknown): string {
    if (error instanceof AppError) {
      return error.userMessage;
    }

    if (error instanceof Error) {
      return 'An unexpected error occurred. Please try again.';
    }

    return 'Something went wrong. Please try again.';
  }
}

/**
 * Error handler for API routes
 */
export function handleApiError(error: unknown) {
  const appError = AppError.fromUnknown(error);

  // Log error (in production, send to monitoring service)
  console.error('[API Error]', appError.toLogFormat());

  return {
    error: appError.toJSON(),
    status: appError.httpStatus,
  };
}
