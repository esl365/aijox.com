/**
 * Error Handling Index
 *
 * Centralized exports for error handling utilities
 */

export {
  ErrorCode,
  ErrorSeverity,
  ERROR_METADATA,
  type ErrorMetadata,
} from './codes';

export {
  AppError,
  handleApiError,
} from './app-error';
