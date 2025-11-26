/**
 * useJobs Hook (React Query)
 *
 * Server state management for jobs data.
 * Handles fetching, caching, and synchronization with server.
 * Uses server actions for data fetching and mutations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FilterState, JobCardData } from '@/lib/design-system';
import { useJobsStore } from '@/lib/stores/jobs-store';
import { getJobs, getJobById, type JobFilters } from '@/app/actions/jobs';
import {
  saveJob,
  unsaveJob,
  getSavedJobs,
  getSavedJobIds,
} from '@/app/actions/saved-jobs';
import { submitApplication } from '@/app/actions/applications';

/**
 * Query Keys Factory
 */
export const jobsKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobsKeys.all, 'list'] as const,
  list: (filters: FilterState, page: number, pageSize: number) =>
    [...jobsKeys.lists(), { filters, page, pageSize }] as const,
  details: () => [...jobsKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobsKeys.details(), id] as const,
  saved: () => [...jobsKeys.all, 'saved'] as const,
};

/**
 * Convert FilterState to JobFilters
 */
function convertFilters(filters: FilterState): JobFilters {
  return {
    countries: filters.countries,
    subjects: filters.subjects,
    minSalary: filters.salaryMin,
    maxSalary: filters.salaryMax,
    housingProvided: filters.housingProvided,
    flightProvided: filters.flightProvided,
    employmentTypes: filters.contractType,
    searchQuery: filters.search,
    sortBy: filters.sortBy,
  };
}

/**
 * Fetch jobs with filters
 */
async function fetchJobs(
  filters: FilterState,
  page: number,
  pageSize: number
): Promise<{
  jobs: JobCardData[];
  total: number;
  hasMore: boolean;
}> {
  const jobFilters = convertFilters(filters);
  const result = await getJobs(jobFilters, page, pageSize);

  // Convert JobPosting[] to JobCardData[]
  const jobs: JobCardData[] = result.jobs.map((job) => ({
    id: job.id,
    title: job.title,
    school: job.schoolName,
    country: job.country,
    city: job.city,
    salaryMin: job.salaryUSD,
    salaryMax: job.salaryUSD,
    currency: job.currency || 'USD',
    contractType: (job.employmentType as any) || 'FULL_TIME',
    visaSponsorship: true, // Default, can be updated based on job data
    subjects: [job.subject],
    postedDate: job.createdAt.toISOString(),
    description: job.description,
    isApplied: false, // Will be populated from server if needed
    isSaved: false, // Will be populated from Zustand store
  }));

  return {
    jobs,
    total: result.total,
    hasMore: result.hasMore,
  };
}

/**
 * Hook: Fetch jobs list with filters
 */
export function useJobs() {
  const filters = useJobsStore((state) => state.filters);
  const currentPage = useJobsStore((state) => state.currentPage);
  const pageSize = useJobsStore((state) => state.pageSize);

  return useQuery({
    queryKey: jobsKeys.list(filters, currentPage, pageSize),
    queryFn: () => fetchJobs(filters, currentPage, pageSize),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

/**
 * Hook: Fetch single job details
 */
export function useJob(jobId: string | null) {
  return useQuery({
    queryKey: jobsKeys.detail(jobId || ''),
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');

      const job = await getJobById(jobId);

      if (!job) {
        throw new Error('Job not found');
      }

      // Convert to JobCardData format
      const jobData: JobCardData = {
        id: job.id,
        title: job.title,
        school: job.schoolName,
        country: job.country,
        city: job.city,
        salaryMin: job.salaryUSD,
        salaryMax: job.salaryUSD,
        currency: job.currency || 'USD',
        contractType: (job.employmentType as any) || 'FULL_TIME',
        visaSponsorship: true,
        subjects: [job.subject],
        postedDate: job.createdAt.toISOString(),
        description: job.description,
        isApplied: false,
        isSaved: false,
      };

      return jobData;
    },
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook: Save/Unsave job
 */
export function useSaveJob() {
  const queryClient = useQueryClient();
  const toggleSavedJob = useJobsStore((state) => state.toggleSavedJob);

  return useMutation({
    mutationFn: async ({
      jobId,
      isSaved,
    }: {
      jobId: string;
      isSaved: boolean;
    }) => {
      if (isSaved) {
        return unsaveJob(jobId);
      } else {
        return saveJob(jobId);
      }
    },
    onMutate: async ({ jobId }) => {
      // Optimistic update in Zustand store
      toggleSavedJob(jobId);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: jobsKeys.saved() });

      // Snapshot previous value
      const previousSaved = queryClient.getQueryData(jobsKeys.saved());

      return { previousSaved };
    },
    onError: (err, { jobId }, context) => {
      // Rollback on error
      toggleSavedJob(jobId);

      if (context?.previousSaved) {
        queryClient.setQueryData(jobsKeys.saved(), context.previousSaved);
      }
    },
    onSettled: () => {
      // Refetch saved jobs
      queryClient.invalidateQueries({ queryKey: jobsKeys.saved() });
    },
  });
}

/**
 * Hook: Apply to job
 */
export function useApplyToJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const result = await submitApplication({ jobId });

      if (!result.success) {
        throw new Error(result.message || 'Failed to apply to job');
      }

      return result;
    },
    onSuccess: (data, jobId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: jobsKeys.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: ['applications'] });

      // Update job in lists cache
      queryClient.setQueriesData(
        { queryKey: jobsKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            jobs: oldData.jobs.map((job: JobCardData) =>
              job.id === jobId ? { ...job, isApplied: true } : job
            ),
          };
        }
      );
    },
  });
}

/**
 * Hook: Get saved jobs
 */
export function useSavedJobs() {
  return useQuery({
    queryKey: jobsKeys.saved(),
    queryFn: async () => {
      const jobs = await getSavedJobs();

      // Convert to JobCardData format
      return jobs.map((job) => ({
        id: job.id,
        title: job.title,
        school: job.schoolName,
        country: job.country,
        city: job.city,
        salaryMin: job.salaryUSD,
        salaryMax: job.salaryUSD,
        currency: job.currency || 'USD',
        contractType: (job.employmentType as any) || 'FULL_TIME',
        visaSponsorship: true,
        subjects: [job.subject],
        postedDate: job.createdAt.toISOString(),
        description: job.description,
        isApplied: false,
        isSaved: true,
      })) as JobCardData[];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook: Get saved job IDs (for checking if a job is saved)
 */
export function useSavedJobIds() {
  return useQuery({
    queryKey: [...jobsKeys.saved(), 'ids'],
    queryFn: () => getSavedJobIds(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}


/**
 * Hook: Prefetch next page
 */
export function usePrefetchNextPage() {
  const queryClient = useQueryClient();
  const filters = useJobsStore((state) => state.filters);
  const currentPage = useJobsStore((state) => state.currentPage);
  const pageSize = useJobsStore((state) => state.pageSize);

  return () => {
    queryClient.prefetchQuery({
      queryKey: jobsKeys.list(filters, currentPage + 1, pageSize),
      queryFn: () => fetchJobs(filters, currentPage + 1, pageSize),
      staleTime: 2 * 60 * 1000,
    });
  };
}
