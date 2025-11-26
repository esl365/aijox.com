/**
 * Configuration Index
 *
 * Centralized exports for all configuration modules
 */

export {
  APP_CONFIG,
  ENV,
  isFeatureEnabled,
  getRateLimit,
  type AppConfig,
  type FeatureFlag,
} from './app';

export {
  SCORING_CONFIG,
  getMatchQuality,
  getVideoQuality,
  getSearchRank,
  isProfileComplete,
  shouldRecontact,
  type ScoringConfig,
} from './scoring';
