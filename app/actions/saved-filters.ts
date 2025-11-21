/**
 * Server Actions for Saved Filters (P1.7)
 *
 * Advanced filtering and saved filter configurations
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ApplicationStatus } from '@prisma/client';

export type FilterConfig = {
  status?: ApplicationStatus[];
  rating?: { min?: number; max?: number };
  tags?: string[];
  aiMatchScore?: { min?: number; max?: number };
  dateRange?: { from?: string; to?: string };
  jobIds?: string[];
  assignedToId?: string;
  searchQuery?: string;
};

/**
 * Get all saved filters for current user
 */
export async function getSavedFilters() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
        filters: []
      };
    }

    const filters = await prisma.savedFilter.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return {
      success: true,
      filters
    };

  } catch (error: any) {
    console.error('Failed to get saved filters:', error);
    return {
      success: false,
      error: error.message,
      filters: []
    };
  }
}

/**
 * Create a new saved filter
 */
export async function createSavedFilter(name: string, filterConfig: FilterConfig, isDefault: boolean = false) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // If this is set as default, unset any existing default
    if (isDefault) {
      await prisma.savedFilter.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }

    const filter = await prisma.savedFilter.create({
      data: {
        userId: session.user.id,
        name,
        filterConfig: filterConfig as any,
        isDefault
      }
    });

    revalidatePath('/school/applications');

    return {
      success: true,
      filter
    };

  } catch (error: any) {
    console.error('Failed to create saved filter:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update a saved filter
 */
export async function updateSavedFilter(
  filterId: string,
  name: string,
  filterConfig: FilterConfig,
  isDefault: boolean = false
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Verify ownership
    const existingFilter = await prisma.savedFilter.findUnique({
      where: {
        id: filterId,
        userId: session.user.id
      }
    });

    if (!existingFilter) {
      return {
        success: false,
        error: 'Filter not found'
      };
    }

    // If this is set as default, unset any existing default
    if (isDefault) {
      await prisma.savedFilter.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          id: { not: filterId }
        },
        data: {
          isDefault: false
        }
      });
    }

    const filter = await prisma.savedFilter.update({
      where: {
        id: filterId
      },
      data: {
        name,
        filterConfig: filterConfig as any,
        isDefault
      }
    });

    revalidatePath('/school/applications');

    return {
      success: true,
      filter
    };

  } catch (error: any) {
    console.error('Failed to update saved filter:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete a saved filter
 */
export async function deleteSavedFilter(filterId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Verify ownership
    const filter = await prisma.savedFilter.findUnique({
      where: {
        id: filterId,
        userId: session.user.id
      }
    });

    if (!filter) {
      return {
        success: false,
        error: 'Filter not found'
      };
    }

    await prisma.savedFilter.delete({
      where: {
        id: filterId
      }
    });

    revalidatePath('/school/applications');

    return {
      success: true,
      message: 'Filter deleted successfully'
    };

  } catch (error: any) {
    console.error('Failed to delete saved filter:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Set a filter as default
 */
export async function setDefaultFilter(filterId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Verify ownership
    const filter = await prisma.savedFilter.findUnique({
      where: {
        id: filterId,
        userId: session.user.id
      }
    });

    if (!filter) {
      return {
        success: false,
        error: 'Filter not found'
      };
    }

    // Unset any existing default
    await prisma.savedFilter.updateMany({
      where: {
        userId: session.user.id,
        isDefault: true
      },
      data: {
        isDefault: false
      }
    });

    // Set this as default
    await prisma.savedFilter.update({
      where: {
        id: filterId
      },
      data: {
        isDefault: true
      }
    });

    revalidatePath('/school/applications');

    return {
      success: true,
      message: 'Default filter set successfully'
    };

  } catch (error: any) {
    console.error('Failed to set default filter:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Apply a filter and get filtered applications
 */
export async function applyFilter(filterConfig: FilterConfig) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return {
        success: false,
        error: 'Unauthorized',
        applications: []
      };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return {
        success: false,
        error: 'School profile not found',
        applications: []
      };
    }

    // Build where clause based on filter config
    const where: any = {
      job: {
        schoolId: schoolProfile.id
      }
    };

    if (filterConfig.status && filterConfig.status.length > 0) {
      where.status = { in: filterConfig.status };
    }

    if (filterConfig.aiMatchScore) {
      where.aiMatchScore = {};
      if (filterConfig.aiMatchScore.min !== undefined) {
        where.aiMatchScore.gte = filterConfig.aiMatchScore.min;
      }
      if (filterConfig.aiMatchScore.max !== undefined) {
        where.aiMatchScore.lte = filterConfig.aiMatchScore.max;
      }
    }

    if (filterConfig.dateRange) {
      where.createdAt = {};
      if (filterConfig.dateRange.from) {
        where.createdAt.gte = new Date(filterConfig.dateRange.from);
      }
      if (filterConfig.dateRange.to) {
        where.createdAt.lte = new Date(filterConfig.dateRange.to);
      }
    }

    if (filterConfig.jobIds && filterConfig.jobIds.length > 0) {
      where.jobId = { in: filterConfig.jobIds };
    }

    // Filter by rating
    if (filterConfig.rating) {
      where.rating = {};
      if (filterConfig.rating.min !== undefined) {
        where.rating.rating = { gte: filterConfig.rating.min };
      }
      if (filterConfig.rating.max !== undefined) {
        where.rating.rating = where.rating.rating
          ? { ...where.rating.rating, lte: filterConfig.rating.max }
          : { lte: filterConfig.rating.max };
      }
    }

    // Filter by tags
    if (filterConfig.tags && filterConfig.tags.length > 0) {
      where.rating = {
        ...where.rating,
        tags: { hasSome: filterConfig.tags }
      };
    }

    // Filter by assigned user
    if (filterConfig.assignedToId) {
      where.rating = {
        ...where.rating,
        assignedToId: filterConfig.assignedToId
      };
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            title: true,
            city: true
          }
        },
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        rating: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Apply search query if provided (client-side filter for simplicity)
    let filteredApplications = applications;
    if (filterConfig.searchQuery) {
      const query = filterConfig.searchQuery.toLowerCase();
      filteredApplications = applications.filter(app =>
        app.teacher?.user?.name?.toLowerCase().includes(query) ||
        app.teacher?.user?.email?.toLowerCase().includes(query) ||
        app.job?.title?.toLowerCase().includes(query) ||
        false
      );
    }

    return {
      success: true,
      applications: filteredApplications
    };

  } catch (error: any) {
    console.error('Failed to apply filter:', error);
    return {
      success: false,
      error: error.message,
      applications: []
    };
  }
}
