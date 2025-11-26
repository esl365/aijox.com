/**
 * useProfile Hook (React Query)
 *
 * Server state management for teacher profile data.
 * Uses server actions for data fetching and mutations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TeacherProfileSummary } from '@/lib/design-system';
import {
  getCurrentProfile,
  calculateProfileCompleteness,
  updateProfile,
  isProfileReady as checkProfileReady,
} from '@/app/actions/profile';

/**
 * Query Keys Factory
 */
export const profileKeys = {
  all: ['profile'] as const,
  current: () => [...profileKeys.all, 'current'] as const,
  completeness: () => [...profileKeys.all, 'completeness'] as const,
};

/**
 * Hook: Get current user's profile
 */
export function useCurrentProfile() {
  return useQuery({
    queryKey: profileKeys.current(),
    queryFn: () => getCurrentProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook: Calculate profile completeness
 */
export function useProfileCompleteness() {
  return useQuery({
    queryKey: profileKeys.completeness(),
    queryFn: () => calculateProfileCompleteness(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook: Update profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<TeacherProfileSummary>) => {
      const result = await updateProfile(data);

      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
      queryClient.invalidateQueries({ queryKey: profileKeys.completeness() });
    },
  });
}

/**
 * Hook: Upload video resume
 */
export function useUploadVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch('/api/profile/video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload video');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
      queryClient.invalidateQueries({ queryKey: profileKeys.completeness() });
    },
  });
}

/**
 * Hook: Check if profile meets requirements for job application
 */
export function useProfileReadiness(requiredFields: string[]) {
  const { data: profile } = useCurrentProfile();
  const { data: completeness } = useProfileCompleteness();

  if (!profile || !completeness) {
    return {
      isReady: false,
      missingFields: requiredFields,
      completeness: 0,
    };
  }

  const missingFields = requiredFields.filter((field) => {
    const value = (profile as Record<string, unknown>)[field];
    return !value || (Array.isArray(value) && value.length === 0);
  });

  return {
    isReady: missingFields.length === 0 && completeness.completeness >= 80,
    missingFields,
    completeness: completeness.completeness,
  };
}
