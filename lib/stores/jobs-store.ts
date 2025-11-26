/**
 * Jobs Store (Zustand)
 *
 * Client-side state management for job search, filters, and UI state.
 * This store handles temporary UI state that doesn't need server persistence.
 *
 * Server state (actual job data) is managed by React Query in hooks/use-jobs.ts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FilterState } from '@/lib/design-system';

interface JobsStore {
  // Filters
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  updateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  clearFilters: () => void;

  // View mode
  view: 'grid' | 'list' | 'map';
  setView: (view: 'grid' | 'list' | 'map') => void;

  // Saved jobs (IDs only, for quick lookup)
  savedJobIds: Set<string>;
  toggleSavedJob: (jobId: string) => void;
  isSaved: (jobId: string) => boolean;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

const initialFilters: FilterState = {
  countries: [],
  subjects: [],
  visaSponsorship: undefined,
  salaryMin: undefined,
  salaryMax: undefined,
  contractType: [],
  gradeLevel: [],
  startDate: undefined,
  remote: undefined,
  urgent: undefined,
  featured: undefined,
};

export const useJobsStore = create<JobsStore>()(
  persist(
    (set, get) => ({
      // Filters
      filters: initialFilters,

      setFilters: (filters) => set({ filters, currentPage: 1 }),

      updateFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
          currentPage: 1, // Reset to first page when filter changes
        })),

      clearFilters: () =>
        set({
          filters: initialFilters,
          currentPage: 1,
        }),

      // View mode
      view: 'grid',
      setView: (view) => set({ view }),

      // Saved jobs
      savedJobIds: new Set<string>(),

      toggleSavedJob: (jobId) =>
        set((state) => {
          const newSet = new Set(state.savedJobIds);
          if (newSet.has(jobId)) {
            newSet.delete(jobId);
          } else {
            newSet.add(jobId);
          }
          return { savedJobIds: newSet };
        }),

      isSaved: (jobId) => get().savedJobIds.has(jobId),

      // Search
      searchQuery: '',
      setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),

      // Pagination
      currentPage: 1,
      setCurrentPage: (currentPage) => set({ currentPage }),
      pageSize: 12,
      setPageSize: (pageSize) => set({ pageSize, currentPage: 1 }),
    }),
    {
      name: 'jobs-storage',
      // Only persist user preferences, not temporary state
      partialize: (state) => ({
        view: state.view,
        savedJobIds: Array.from(state.savedJobIds), // Convert Set to Array for serialization
        pageSize: state.pageSize,
      }),
      // Restore Set from Array
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.savedJobIds)) {
          state.savedJobIds = new Set(state.savedJobIds);
        }
      },
    }
  )
);

/**
 * Selector hooks for optimized re-renders
 */
export const useFilters = () => useJobsStore((state) => state.filters);
export const useFilterActions = () =>
  useJobsStore((state) => ({
    setFilters: state.setFilters,
    updateFilter: state.updateFilter,
    clearFilters: state.clearFilters,
  }));

export const useViewMode = () => useJobsStore((state) => state.view);
export const useSavedJobs = () =>
  useJobsStore((state) => ({
    savedJobIds: state.savedJobIds,
    toggleSavedJob: state.toggleSavedJob,
    isSaved: state.isSaved,
  }));

export const useSearchQuery = () => useJobsStore((state) => state.searchQuery);
export const usePagination = () =>
  useJobsStore((state) => ({
    currentPage: state.currentPage,
    pageSize: state.pageSize,
    setCurrentPage: state.setCurrentPage,
    setPageSize: state.setPageSize,
  }));
