/**
 * Unit tests for lib/utils/routing.ts
 */

import { describe, it, expect } from 'vitest';
import {
  getSetupUrl,
  getDashboardUrl,
  needsProfileSetup,
  getRoleRoutes,
  ROLE_ROUTES,
} from '@/lib/utils/routing';

describe('getSetupUrl', () => {
  it('should return teacher setup URL', () => {
    expect(getSetupUrl('TEACHER')).toBe('/profile/setup');
  });

  it('should return recruiter setup URL', () => {
    expect(getSetupUrl('RECRUITER')).toBe('/recruiter/setup');
  });

  it('should return school setup URL', () => {
    expect(getSetupUrl('SCHOOL')).toBe('/school/setup');
  });

  it('should return dashboard for unknown role with dashboard fallback', () => {
    expect(getSetupUrl('UNKNOWN')).toBe('/dashboard');
  });

  it('should return select-role for unknown role with select-role fallback', () => {
    expect(getSetupUrl('UNKNOWN', 'select-role')).toBe('/select-role');
  });

  it('should handle ADMIN role with dashboard fallback', () => {
    expect(getSetupUrl('ADMIN')).toBe('/dashboard');
  });
});

describe('getDashboardUrl', () => {
  it('should return teacher dashboard URL', () => {
    expect(getDashboardUrl('TEACHER')).toBe('/dashboard');
  });

  it('should return recruiter dashboard URL', () => {
    expect(getDashboardUrl('RECRUITER')).toBe('/recruiter/dashboard');
  });

  it('should return school dashboard URL', () => {
    expect(getDashboardUrl('SCHOOL')).toBe('/school/dashboard');
  });

  it('should return admin dashboard URL', () => {
    expect(getDashboardUrl('ADMIN')).toBe('/admin/dashboard');
  });

  it('should return default dashboard for unknown role', () => {
    expect(getDashboardUrl('UNKNOWN')).toBe('/dashboard');
  });
});

describe('needsProfileSetup', () => {
  it('should return false when role is null', () => {
    expect(needsProfileSetup(null, false)).toBe(false);
  });

  it('should return false when role is undefined', () => {
    expect(needsProfileSetup(undefined, false)).toBe(false);
  });

  it('should return false when hasProfile is true', () => {
    expect(needsProfileSetup('TEACHER', true)).toBe(false);
  });

  it('should return true for TEACHER without profile', () => {
    expect(needsProfileSetup('TEACHER', false)).toBe(true);
  });

  it('should return true for RECRUITER without profile', () => {
    expect(needsProfileSetup('RECRUITER', false)).toBe(true);
  });

  it('should return true for SCHOOL without profile', () => {
    expect(needsProfileSetup('SCHOOL', false)).toBe(true);
  });

  it('should return false for ADMIN without profile', () => {
    expect(needsProfileSetup('ADMIN', false)).toBe(false);
  });

  it('should handle null hasProfile for roles that need setup', () => {
    expect(needsProfileSetup('TEACHER', null)).toBe(true);
  });

  it('should handle undefined hasProfile for roles that need setup', () => {
    expect(needsProfileSetup('TEACHER', undefined)).toBe(true);
  });
});

describe('ROLE_ROUTES', () => {
  it('should have correct TEACHER routes', () => {
    expect(ROLE_ROUTES.TEACHER).toEqual({
      setup: '/profile/setup',
      dashboard: '/dashboard',
      profile: '/profile',
      jobs: '/jobs',
    });
  });

  it('should have correct RECRUITER routes', () => {
    expect(ROLE_ROUTES.RECRUITER).toEqual({
      setup: '/recruiter/setup',
      dashboard: '/recruiter/dashboard',
      jobs: '/recruiter/jobs',
      candidates: '/recruiter/candidates',
    });
  });

  it('should have correct SCHOOL routes', () => {
    expect(ROLE_ROUTES.SCHOOL).toEqual({
      setup: '/school/setup',
      dashboard: '/school/dashboard',
      jobs: '/school/jobs',
      candidates: '/school/candidates',
    });
  });

  it('should have correct ADMIN routes', () => {
    expect(ROLE_ROUTES.ADMIN).toEqual({
      dashboard: '/admin/dashboard',
      users: '/admin/users',
      analytics: '/admin/analytics',
    });
  });
});

describe('getRoleRoutes', () => {
  it('should return TEACHER routes for TEACHER role', () => {
    const routes = getRoleRoutes('TEACHER');
    expect(routes).toEqual(ROLE_ROUTES.TEACHER);
  });

  it('should return RECRUITER routes for RECRUITER role', () => {
    const routes = getRoleRoutes('RECRUITER');
    expect(routes).toEqual(ROLE_ROUTES.RECRUITER);
  });

  it('should return SCHOOL routes for SCHOOL role', () => {
    const routes = getRoleRoutes('SCHOOL');
    expect(routes).toEqual(ROLE_ROUTES.SCHOOL);
  });

  it('should return ADMIN routes for ADMIN role', () => {
    const routes = getRoleRoutes('ADMIN');
    expect(routes).toEqual(ROLE_ROUTES.ADMIN);
  });

  it('should return TEACHER routes for unknown role', () => {
    const routes = getRoleRoutes('UNKNOWN');
    expect(routes).toEqual(ROLE_ROUTES.TEACHER);
  });
});
