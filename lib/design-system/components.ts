/**
 * Component TypeScript Interfaces
 *
 * Type definitions for all new UI components in the redesign.
 * Based on Wellfound benchmark and SPARC Phase 1 specification.
 */

import { ReactNode } from 'react';

/**
 * Base component props that all components should extend
 */
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

/**
 * FR-001: Enhanced Hero Section
 */
export interface HeroSectionProps extends BaseComponentProps {
  headline: string;
  subheadlines: string[]; // Rotating subheadlines
  primaryCTA: CTAButton;
  secondaryCTA: CTAButton;
  socialProof: SocialProofMetric[];
  quickNavigationCards: QuickNavCard[];
  backgroundElements?: ReactNode;
}

export interface CTAButton {
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
  icon?: ReactNode;
  onClick?: () => void;
}

export interface SocialProofMetric {
  value: number;
  label: string;
  icon?: ReactNode;
  animateCounter?: boolean;
}

export interface QuickNavCard {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  badge?: string;
}

/**
 * FR-002: Role-Based Navigation
 */
export interface NavigationProps extends BaseComponentProps {
  role?: 'teacher' | 'recruiter' | 'guest';
  sticky?: boolean;
  transparent?: boolean;
}

export interface DropdownMenu {
  label: string;
  items: DropdownMenuItem[];
}

export interface DropdownMenuItem {
  label: string;
  description?: string;
  href?: string;
  icon?: ReactNode;
  badge?: string;
  onClick?: () => void;
}

export interface MobileMenuProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: DropdownMenu[];
}

export interface MobileBottomNavProps extends BaseComponentProps {
  currentPath: string;
}

/**
 * FR-003: Enhanced Job Cards
 */
export interface JobCardV2Props extends BaseComponentProps {
  job: JobCardData;
  variant?: 'default' | 'featured' | 'compact';
  onSave?: (jobId: string) => void;
  onQuickApply?: (jobId: string) => void;
  isSaved?: boolean;
  isApplied?: boolean;
  showQuickApply?: boolean;
}

export interface JobCardData {
  id: string;
  title: string;
  school: string;
  schoolLogo?: string;
  location: string;
  country: string;
  city?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  visaSponsorship: boolean;
  contractType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
  startDate: string;
  subjects: string[];
  gradeLevel?: string;
  isUrgent?: boolean;
  isFeatured?: boolean;
  postedAt: Date;
  applicantCount?: number;
  viewCount?: number;
}

export interface JobBadgeProps extends BaseComponentProps {
  type: 'visa' | 'urgent' | 'featured' | 'new' | 'remote';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * FR-004: Advanced Filters Panel
 */
export interface FiltersPanelProps extends BaseComponentProps {
  filters: FilterState;
  filterCounts: FilterCounts;
  onFilterChange: (filters: FilterState) => void;
  onClearAll: () => void;
  variant?: 'sidebar' | 'modal' | 'inline';
}

export interface FilterState {
  countries?: string[];
  subjects?: string[];
  visaSponsorship?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  contractType?: string[];
  gradeLevel?: string[];
  startDate?: {
    from?: Date;
    to?: Date;
  };
  remote?: boolean;
  urgent?: boolean;
  featured?: boolean;
}

export interface FilterCounts {
  [key: string]: number; // e.g., { "Japan": 45, "China": 32 }
}

export interface FilterSectionProps extends BaseComponentProps {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  count?: number;
}

export interface FilterCheckboxProps extends BaseComponentProps {
  label: string;
  value: string;
  checked: boolean;
  count?: number;
  onChange: (checked: boolean) => void;
}

export interface FilterRangeProps extends BaseComponentProps {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatLabel?: (value: number) => string;
}

/**
 * FR-005: One-Click Apply Flow
 */
export interface QuickApplyModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobCardData;
  profile: TeacherProfileSummary;
  onConfirm: () => Promise<void>;
}

export interface TeacherProfileSummary {
  id: string;
  name: string;
  avatar?: string;
  videoUrl?: string;
  resumeUrl?: string;
  bio?: string;
  completeness: number;
  yearsExperience: number;
  subjects: string[];
  citizenship?: string;
}

export interface ProfileCompletenessCheckProps extends BaseComponentProps {
  profile: TeacherProfileSummary;
  requiredFields: string[];
  onComplete: () => void;
}

export interface ApplicationConfirmationProps extends BaseComponentProps {
  job: JobCardData;
  profile: TeacherProfileSummary;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Animation Components
 */
export interface AnimatedTextProps extends BaseComponentProps {
  text: string;
  animation?: 'slideUp' | 'fadeIn' | 'scaleIn' | 'wordByWord';
  stagger?: number;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export interface AnimatedCounterProps extends BaseComponentProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export interface ParallaxElementProps extends BaseComponentProps {
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

/**
 * State Management Types
 */
export interface JobsState {
  jobs: JobCardData[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  view: 'grid' | 'list' | 'map';
}

export interface SavedJobsState {
  jobIds: string[];
  isLoading: boolean;
}

export interface ApplicationState {
  jobId: string | null;
  status: 'idle' | 'checking' | 'applying' | 'success' | 'error';
  error: string | null;
}

export interface UIState {
  isMobileMenuOpen: boolean;
  isFiltersOpen: boolean;
  activeModal: string | null;
  theme: 'light' | 'dark';
}

/**
 * Search & Discovery
 */
export interface SearchBarProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
}

export interface SearchSuggestion {
  type: 'job' | 'school' | 'location' | 'keyword';
  label: string;
  value: string;
  metadata?: Record<string, any>;
}

export interface JobGridProps extends BaseComponentProps {
  jobs: JobCardData[];
  isLoading?: boolean;
  emptyMessage?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export interface JobListSkeletonProps extends BaseComponentProps {
  count?: number;
  variant?: 'default' | 'compact';
}

/**
 * Modal Components
 */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export interface BottomSheetProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  snapPoints?: number[];
}

/**
 * Toast Notifications
 */
export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

/**
 * Loading States
 */
export interface LoadingStateProps extends BaseComponentProps {
  type: 'spinner' | 'skeleton' | 'progress';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

/**
 * Empty States
 */
export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Error States
 */
export interface ErrorStateProps extends BaseComponentProps {
  title: string;
  description?: string;
  error?: Error;
  onRetry?: () => void;
  showDetails?: boolean;
}

/**
 * Accessibility Props
 */
export interface A11yProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-selected'?: boolean;
  'aria-pressed'?: boolean;
  'aria-checked'?: boolean;
  role?: string;
  tabIndex?: number;
}

/**
 * Type Guards
 */
export const isJobCardData = (obj: any): obj is JobCardData => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'school' in obj &&
    'country' in obj
  );
};

export const isFilterState = (obj: any): obj is FilterState => {
  return typeof obj === 'object' && obj !== null;
};
