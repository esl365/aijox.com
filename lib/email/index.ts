/**
 * Email Utilities Index
 *
 * Centralized exports for email-related functions
 */

export {
  formatJobEmailHTML,
  formatJobEmailPlainText,
  generateFallbackEmail,
  formatEmailSubject,
} from './formatting';

export {
  notifyTeacherVideoAnalyzed,
  notifySchoolNewApplication,
} from './notifications';
