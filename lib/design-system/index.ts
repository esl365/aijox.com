/**
 * Design System Index
 *
 * Central export point for the design system.
 * Import everything you need from here.
 *
 * @example
 * import { designTokens, animationPresets, JobCardV2Props } from '@/lib/design-system';
 */

// Tokens
export * from './tokens';
export type {
  DesignTokens,
  ColorScale,
  Spacing,
  FontSize,
  FontWeight,
  BorderRadius,
  BoxShadow,
  ZIndex,
  Breakpoint,
} from './tokens';

// Animation
export * from './animation';
export type {
  AnimationSpeed,
  SpringConfig,
  TransitionPreset,
} from './animation';

// Component Types
export * from './components';
export type {
  BaseComponentProps,
  HeroSectionProps,
  NavigationProps,
  JobCardV2Props,
  JobCardData,
  FiltersPanelProps,
  FilterState,
  QuickApplyModalProps,
  TeacherProfileSummary,
  AnimatedTextProps,
  SearchBarProps,
  JobGridProps,
  ModalProps,
  ToastProps,
  A11yProps,
} from './components';
