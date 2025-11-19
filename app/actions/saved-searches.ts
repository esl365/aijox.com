/**
 * Server Actions for Saved Searches & Job Alerts
 *
 * Handles CRUD operations for saved job searches
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getJobs } from './jobs';
import type { Prisma, SavedSearch } from '@prisma/client';
import type {
  CreateSavedSearchInput,
  UpdateSavedSearchInput,
  SavedSearchFilters,
  AlertFrequency,
} from '@/lib/types/saved-search';
import {
  isValidAlertFrequency,
  generateSearchSummary,
  ALERT_FREQUENCIES,
} from '@/lib/types/saved-search';

/**
 * Create a new saved search
 */
export async function createSavedSearch(input: CreateSavedSearchInput) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return {
        success: false,
        error: 'Unauthorized',
        message: 'Please login as a teacher to save searches',
      };
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!teacherProfile) {
      return {
        success: false,
        error: 'Profile not found',
        message: 'Please complete your profile first',
      };
    }

    // Validate alert frequency
    const alertFrequency = input.alertFrequency || ALERT_FREQUENCIES.DAILY;
    if (!isValidAlertFrequency(alertFrequency)) {
      return {
        success: false,
        error: 'Invalid alert frequency',
        message: 'Please select a valid alert frequency',
      };
    }

    // Generate default name if not provided
    const name = input.name || generateSearchSummary(input.filters);

    // Create saved search
    const savedSearch = await prisma.savedSearch.create({
      data: {
        teacherId: teacherProfile.id,
        name,
        filters: input.filters as Prisma.JsonObject,
        alertEmail: input.alertEmail !== undefined ? input.alertEmail : true,
        alertFrequency,
        isActive: true,
      },
    });

    revalidatePath('/saved-searches');

    return {
      success: true,
      message: 'Search saved successfully',
      savedSearch: {
        id: savedSearch.id,
        name: savedSearch.name,
      },
    };
  } catch (error: any) {
    console.error('[Saved Searches] Create failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to save search. Please try again.',
    };
  }
}

/**
 * Get all saved searches for current user
 */
export async function getMySavedSearches(): Promise<SavedSearch[]> {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return [];
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!teacherProfile) {
      return [];
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: {
        teacherId: teacherProfile.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return savedSearches;
  } catch (error) {
    console.error('[Saved Searches] Fetch failed:', error);
    return [];
  }
}

/**
 * Get single saved search by ID
 */
export async function getSavedSearchById(id: string): Promise<SavedSearch | null> {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return null;
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!teacherProfile) {
      return null;
    }

    const savedSearch = await prisma.savedSearch.findUnique({
      where: {
        id,
        teacherId: teacherProfile.id, // Ensure ownership
      },
    });

    return savedSearch;
  } catch (error) {
    console.error('[Saved Searches] Fetch by ID failed:', error);
    return null;
  }
}

/**
 * Update a saved search
 */
export async function updateSavedSearch(id: string, input: UpdateSavedSearchInput) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!teacherProfile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    // Verify ownership
    const existingSearch = await prisma.savedSearch.findUnique({
      where: {
        id,
        teacherId: teacherProfile.id,
      },
    });

    if (!existingSearch) {
      return {
        success: false,
        error: 'Search not found or unauthorized',
      };
    }

    // Validate alert frequency if provided
    if (input.alertFrequency && !isValidAlertFrequency(input.alertFrequency)) {
      return {
        success: false,
        error: 'Invalid alert frequency',
      };
    }

    // Build update data
    const updateData: Prisma.SavedSearchUpdateInput = {};

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.filters !== undefined) {
      updateData.filters = input.filters as Prisma.JsonObject;
    }

    if (input.alertEmail !== undefined) {
      updateData.alertEmail = input.alertEmail;
    }

    if (input.alertFrequency !== undefined) {
      updateData.alertFrequency = input.alertFrequency;
    }

    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }

    // Update
    const updatedSearch = await prisma.savedSearch.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/saved-searches');

    return {
      success: true,
      message: 'Search updated successfully',
      savedSearch: updatedSearch,
    };
  } catch (error: any) {
    console.error('[Saved Searches] Update failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(id: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!teacherProfile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    // Verify ownership before deletion
    const savedSearch = await prisma.savedSearch.findUnique({
      where: {
        id,
        teacherId: teacherProfile.id,
      },
    });

    if (!savedSearch) {
      return {
        success: false,
        error: 'Search not found or unauthorized',
      };
    }

    await prisma.savedSearch.delete({
      where: { id },
    });

    revalidatePath('/saved-searches');

    return {
      success: true,
      message: 'Search deleted successfully',
    };
  } catch (error: any) {
    console.error('[Saved Searches] Delete failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Toggle active status of a saved search
 */
export async function toggleSavedSearchActive(id: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!teacherProfile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    const savedSearch = await prisma.savedSearch.findUnique({
      where: {
        id,
        teacherId: teacherProfile.id,
      },
    });

    if (!savedSearch) {
      return {
        success: false,
        error: 'Search not found or unauthorized',
      };
    }

    const updatedSearch = await prisma.savedSearch.update({
      where: { id },
      data: {
        isActive: !savedSearch.isActive,
      },
    });

    revalidatePath('/saved-searches');

    return {
      success: true,
      message: updatedSearch.isActive
        ? 'Alerts enabled for this search'
        : 'Alerts paused for this search',
      isActive: updatedSearch.isActive,
    };
  } catch (error: any) {
    console.error('[Saved Searches] Toggle failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get matching jobs for a saved search
 */
export async function getJobsForSavedSearch(savedSearchId: string) {
  try {
    const savedSearch = await getSavedSearchById(savedSearchId);

    if (!savedSearch) {
      return {
        success: false,
        error: 'Search not found',
        jobs: [],
      };
    }

    const filters = savedSearch.filters as SavedSearchFilters;

    // Get jobs using the existing getJobs function
    const result = await getJobs(filters, 1, 50); // Get first 50 matches

    return {
      success: true,
      jobs: result.jobs,
      total: result.total,
    };
  } catch (error: any) {
    console.error('[Saved Searches] Get jobs failed:', error);
    return {
      success: false,
      error: error.message,
      jobs: [],
    };
  }
}

/**
 * Save current search from filters
 * (Used in Jobs page "Save this search" button)
 */
export async function saveCurrentSearch(filters: SavedSearchFilters, name?: string) {
  return createSavedSearch({
    name: name || generateSearchSummary(filters),
    filters,
    alertEmail: true,
    alertFrequency: ALERT_FREQUENCIES.DAILY,
  });
}
