import { JobListSkeleton } from '@/components/skeletons/job-card-skeleton';

export default function JobsLoading() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
      </div>

      <JobListSkeleton count={9} />
    </div>
  );
}
