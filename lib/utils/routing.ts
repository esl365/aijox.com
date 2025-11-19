/**
 * Routing Utilities
 *
 * Refinement.md:323-366 - Consolidate duplicated routing logic
 */

import type { UserRole } from '@prisma/client';

/**
 * Get setup URL based on user role
 *
 * Consolidates getSetupUrl() from 4 locations:
 * - middleware.ts:97
 * - app/(auth)/select-role/page.tsx:50
 * - app/(auth)/login/page.tsx:57
 * - app/actions/set-role.ts:59
 */
export function getSetupUrl(role: string, fallback: 'dashboard' | 'select-role' = 'dashboard'): string {
  switch (role) {
    case 'TEACHER':
      return '/profile/setup';
    case 'RECRUITER':
      return '/recruiter/setup';
    case 'SCHOOL':
      return '/school/setup';
    default:
      return fallback === 'dashboard' ? '/dashboard' : '/select-role';
  }
}

/**
 * Get dashboard URL based on user role
 */
export function getDashboardUrl(role: string): string {
  switch (role) {
    case 'TEACHER':
      return '/dashboard';
    case 'RECRUITER':
      return '/recruiter/dashboard';
    case 'SCHOOL':
      return '/school/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/dashboard';
  }
}

/**
 * Check if user needs to complete profile setup
 */
export function needsProfileSetup(role: string | null | undefined, hasProfile: boolean | null | undefined): boolean {
  if (!role) return false;
  if (hasProfile) return false;

  // TEACHER, RECRUITER, SCHOOL roles require profile setup
  return ['TEACHER', 'RECRUITER', 'SCHOOL'].includes(role);
}

/**
 * Get role-specific routes
 */
export const ROLE_ROUTES = {
  TEACHER: {
    setup: '/profile/setup',
    dashboard: '/dashboard',
    profile: '/profile',
    jobs: '/jobs',
  },
  RECRUITER: {
    setup: '/recruiter/setup',
    dashboard: '/recruiter/dashboard',
    jobs: '/recruiter/jobs',
    candidates: '/recruiter/candidates',
  },
  SCHOOL: {
    setup: '/school/setup',
    dashboard: '/school/dashboard',
    jobs: '/school/jobs',
    candidates: '/school/candidates',
  },
  ADMIN: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    analytics: '/admin/analytics',
  },
} as const;

/**
 * Get role routes safely
 */
export function getRoleRoutes(role: UserRole | string) {
  return ROLE_ROUTES[role as keyof typeof ROLE_ROUTES] || ROLE_ROUTES.TEACHER;
}
