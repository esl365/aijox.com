/**
 * Server Actions for School Directory
 *
 * Handles school browsing, filtering, and retrieval
 */

'use server';

import { prisma } from '@/lib/db';
import type { SchoolProfile } from '@prisma/client';

export type SchoolWithStats = SchoolProfile & {
  _count?: {
    jobPostings: number;
  };
  jobPostings?: any[];
};

export type SchoolFilters = {
  country?: string;
  city?: string;
  schoolType?: string;
  searchQuery?: string;
  hasOpenPositions?: boolean;
};

export type SchoolListResponse = {
  schools: SchoolWithStats[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

/**
 * Get schools with filters and pagination
 */
export async function getSchools(
  filters: SchoolFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<SchoolListResponse> {
  try {
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {
      isVerified: true,
    };

    if (filters.country) {
      where.country = filters.country;
    }

    if (filters.city) {
      where.city = filters.city;
    }

    if (filters.schoolType) {
      where.schoolType = filters.schoolType;
    }

    if (filters.searchQuery) {
      where.OR = [
        {
          schoolName: {
            contains: filters.searchQuery,
            mode: 'insensitive' as any,
          },
        },
        {
          city: {
            contains: filters.searchQuery,
            mode: 'insensitive' as any,
          },
        },
        {
          country: {
            contains: filters.searchQuery,
            mode: 'insensitive' as any,
          },
        },
      ];
    }

    // Execute query with pagination
    const [schools, total] = await Promise.all([
      prisma.schoolProfile.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              jobPostings: {
                where: {
                  status: 'ACTIVE',
                },
              },
            },
          },
        },
      }),
      prisma.schoolProfile.count({ where }),
    ]);

    const hasMore = skip + schools.length < total;

    return {
      schools,
      total,
      page,
      pageSize,
      hasMore,
    };
  } catch (error) {
    console.error('Error fetching schools:', error);
    return {
      schools: [],
      total: 0,
      page,
      pageSize,
      hasMore: false,
    };
  }
}

/**
 * Get school by ID with related data
 */
export async function getSchoolById(id: string): Promise<SchoolWithStats | null> {
  try {
    const school = await prisma.schoolProfile.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jobPostings: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
        jobPostings: {
          where: {
            status: 'ACTIVE',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    return school;
  } catch (error) {
    console.error('Error fetching school:', error);
    return null;
  }
}

/**
 * Get filter options for school search
 */
export async function getSchoolFilterOptions() {
  try {
    const [countries, cities, schoolTypes] = await Promise.all([
      // Get unique countries
      prisma.schoolProfile.findMany({
        where: { isVerified: true },
        select: { country: true },
        distinct: ['country'],
        orderBy: { country: 'asc' },
      }),
      // Get unique cities
      prisma.schoolProfile.findMany({
        where: { isVerified: true },
        select: { city: true, country: true },
        distinct: ['city'],
        orderBy: { city: 'asc' },
        take: 50,
      }),
      // Get unique school types
      prisma.schoolProfile.findMany({
        where: {
          isVerified: true,
          schoolType: { not: null },
        },
        select: { schoolType: true },
        distinct: ['schoolType'],
        orderBy: { schoolType: 'asc' },
      }),
    ]);

    return {
      countries: countries.map((c) => c.country),
      cities: cities.map((c) => ({ city: c.city, country: c.country })),
      schoolTypes: schoolTypes
        .map((s) => s.schoolType)
        .filter((t): t is string => t !== null),
    };
  } catch (error) {
    console.error('Error fetching school filter options:', error);
    return {
      countries: [],
      cities: [],
      schoolTypes: [],
    };
  }
}

/**
 * Get school statistics by country
 */
export async function getSchoolStatsByCountry() {
  try {
    const stats = await prisma.schoolProfile.groupBy({
      by: ['country'],
      where: { isVerified: true },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    return stats.map((stat) => ({
      country: stat.country,
      count: stat._count.id,
    }));
  } catch (error) {
    console.error('Error fetching school stats:', error);
    return [];
  }
}

/**
 * Search schools by query
 */
export async function searchSchools(query: string, limit: number = 10) {
  try {
    const schools = await prisma.schoolProfile.findMany({
      where: {
        isVerified: true,
        OR: [
          {
            schoolName: {
              contains: query,
              mode: 'insensitive' as any,
            },
          },
          {
            city: {
              contains: query,
              mode: 'insensitive' as any,
            },
          },
          {
            country: {
              contains: query,
              mode: 'insensitive' as any,
            },
          },
        ],
      },
      take: limit,
      include: {
        _count: {
          select: {
            jobPostings: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: {
        schoolName: 'asc',
      },
    });

    return schools;
  } catch (error) {
    console.error('Error searching schools:', error);
    return [];
  }
}
