import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';

export default function RecruiterDashboardLoading() {
  return (
    <div className="container mx-auto py-8">
      <DashboardSkeleton />
    </div>
  );
}
