/**
 * Server Actions for Job Listings
 *
 * Handles job browsing, filtering, and retrieval
 */

'use server';

import { prisma } from '@/lib/db';
import type { JobPosting } from '@prisma/client';

export type JobFilters = {
  country?: string;
  subject?: string;
  minSalary?: number;
  maxSalary?: number;
  housingProvided?: boolean;
  flightProvided?: boolean;
  searchQuery?: string;
};

export type JobListResponse = {
  jobs: JobPosting[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

/**
 * Get jobs with filters and pagination
 */
export async function getJobs(
  filters: JobFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<JobListResponse> {
  try {
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {
      status: 'ACTIVE'
    };

    if (filters.country) {
      where.country = filters.country;
    }

    if (filters.subject) {
      where.subject = {
        contains: filters.subject,
        mode: 'insensitive'
      };
    }

    if (filters.minSalary !== undefined) {
      where.salaryUSD = {
        ...where.salaryUSD,
        gte: filters.minSalary
      };
    }

    if (filters.maxSalary !== undefined) {
      where.salaryUSD = {
        ...where.salaryUSD,
        lte: filters.maxSalary
      };
    }

    if (filters.housingProvided !== undefined) {
      where.housingProvided = filters.housingProvided;
    }

    if (filters.flightProvided !== undefined) {
      where.flightProvided = filters.flightProvided;
    }

    if (filters.searchQuery) {
      where.OR = [
        { title: { contains: filters.searchQuery, mode: 'insensitive' } },
        { description: { contains: filters.searchQuery, mode: 'insensitive' } },
        { schoolName: { contains: filters.searchQuery, mode: 'insensitive' } },
        { city: { contains: filters.searchQuery, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prisma.jobPosting.count({ where });

    // Get jobs
    const jobs = await prisma.jobPosting.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    return {
      jobs,
      total,
      page,
      pageSize,
      hasMore: skip + jobs.length < total
    };

  } catch (error: any) {
    console.error('Failed to fetch jobs:', error);
    return {
      jobs: [],
      total: 0,
      page,
      pageSize,
      hasMore: false
    };
  }
}

/**
 * Get single job by ID
 */
export async function getJobById(jobId: string) {
  try {
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: {
        school: {
          select: {
            isVerified: true,
            verifiedAt: true,
          },
        },
        recruiter: {
          select: {
            isVerified: true,
            verifiedAt: true,
          },
        },
      },
    });

    return job;
  } catch (error) {
    console.error('Failed to fetch job:', error);
    return null;
  }
}

/**
 * Get available filter options (for UI dropdowns)
 */
export async function getJobFilterOptions() {
  try {
    // Get distinct countries
    const countries = await prisma.jobPosting.findMany({
      where: { status: 'ACTIVE' },
      select: { country: true },
      distinct: ['country']
    });

    // Get distinct subjects
    const subjects = await prisma.jobPosting.findMany({
      where: { status: 'ACTIVE' },
      select: { subject: true },
      distinct: ['subject']
    });

    // Get salary range
    const salaryStats = await prisma.jobPosting.aggregate({
      where: { status: 'ACTIVE' },
      _min: { salaryUSD: true },
      _max: { salaryUSD: true }
    });

    return {
      countries: countries.map(c => c.country).sort(),
      subjects: subjects.map(s => s.subject).sort(),
      salaryRange: {
        min: salaryStats._min.salaryUSD || 2000,
        max: salaryStats._max.salaryUSD || 8000
      }
    };

  } catch (error) {
    console.error('Failed to fetch filter options:', error);
    return {
      countries: [],
      subjects: [],
      salaryRange: { min: 2000, max: 8000 }
    };
  }
}

/**
 * Get job statistics by country
 */
export async function getJobStatsByCountry() {
  try {
    const stats = await prisma.jobPosting.groupBy({
      by: ['country'],
      where: { status: 'ACTIVE' },
      _count: {
        id: true
      },
      _avg: {
        salaryUSD: true
      }
    });

    return stats.map(s => ({
      country: s.country,
      count: s._count.id,
      avgSalary: Math.round(s._avg.salaryUSD || 0)
    }));

  } catch (error) {
    console.error('Failed to fetch job stats:', error);
    return [];
  }
}

/**
 * Get featured jobs (high salary, recent postings)
 */
export async function getFeaturedJobs(limit: number = 6): Promise<JobPosting[]> {
  try {
    const jobs = await prisma.jobPosting.findMany({
      where: {
        status: 'ACTIVE'
      },
      orderBy: [
        { salaryUSD: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    return jobs;

  } catch (error) {
    console.error('Failed to fetch featured jobs:', error);
    return [];
  }
}

/**
 * Get jobs by country (for country-specific pages)
 */
export async function getJobsByCountry(
  country: string,
  page: number = 1,
  pageSize: number = 20
): Promise<JobListResponse> {
  return getJobs({ country }, page, pageSize);
}

/**
 * Search jobs with text query
 */
export async function searchJobs(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<JobListResponse> {
  return getJobs({ searchQuery: query }, page, pageSize);
}
