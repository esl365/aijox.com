import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getRecruiterAnalytics } from '@/app/actions/analytics';
import { StatCard } from '@/components/analytics/StatCard';
import { ConversionFunnel } from '@/components/analytics/ConversionFunnel';
import { RecentActivity } from '@/components/analytics/RecentActivity';
import { TopJobsTable } from '@/components/analytics/TopJobsTable';
import {
  Briefcase,
  Users,
  UserCheck,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Global Educator Nexus',
  description: 'View your recruitment analytics, application metrics, and hiring performance.',
};

export default async function RecruiterAnalyticsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'RECRUITER') {
    redirect('/auth/signin');
  }

  const analytics = await getRecruiterAnalytics();

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No Analytics Available</h1>
          <p className="mt-2 text-muted-foreground">
            Complete your recruiter profile to view analytics.
          </p>
        </div>
      </div>
    );
  }

  // Prepare funnel data
  const funnelStages = [
    {
      label: 'New',
      count: analytics.applicationStats.newApplications,
      percentage: analytics.applicationStats.totalApplications > 0
        ? Math.round((analytics.applicationStats.newApplications / analytics.applicationStats.totalApplications) * 100)
        : 0,
      color: 'bg-blue-500',
    },
    {
      label: 'Screening',
      count: analytics.applicationStats.screeningApplications,
      percentage: analytics.applicationStats.totalApplications > 0
        ? Math.round((analytics.applicationStats.screeningApplications / analytics.applicationStats.totalApplications) * 100)
        : 0,
      color: 'bg-yellow-500',
    },
    {
      label: 'Interview',
      count: analytics.applicationStats.interviewApplications,
      percentage: analytics.applicationStats.totalApplications > 0
        ? Math.round((analytics.applicationStats.interviewApplications / analytics.applicationStats.totalApplications) * 100)
        : 0,
      color: 'bg-purple-500',
    },
    {
      label: 'Offer',
      count: analytics.applicationStats.offerApplications,
      percentage: analytics.applicationStats.totalApplications > 0
        ? Math.round((analytics.applicationStats.offerApplications / analytics.applicationStats.totalApplications) * 100)
        : 0,
      color: 'bg-orange-500',
    },
    {
      label: 'Hired',
      count: analytics.applicationStats.hiredApplications,
      percentage: analytics.applicationStats.totalApplications > 0
        ? Math.round((analytics.applicationStats.hiredApplications / analytics.applicationStats.totalApplications) * 100)
        : 0,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Track your recruitment performance and application metrics
        </p>
      </div>

      {/* Job Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Jobs"
          value={analytics.jobStats.totalJobs}
          icon={Briefcase}
          subtitle="All time"
        />
        <StatCard
          title="Active Jobs"
          value={analytics.jobStats.activeJobs}
          icon={Clock}
          subtitle="Currently hiring"
        />
        <StatCard
          title="Filled Jobs"
          value={analytics.jobStats.filledJobs}
          icon={CheckCircle}
          subtitle="Positions filled"
        />
        <StatCard
          title="Closed Jobs"
          value={analytics.jobStats.closedJobs}
          icon={Briefcase}
          subtitle="No longer active"
        />
      </div>

      {/* Application Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Applications"
          value={analytics.applicationStats.totalApplications}
          icon={Users}
          subtitle="All applications"
        />
        <StatCard
          title="New Applications"
          value={analytics.applicationStats.newApplications}
          icon={TrendingUp}
          subtitle="Awaiting review"
        />
        <StatCard
          title="In Interview"
          value={analytics.applicationStats.interviewApplications}
          icon={Users}
          subtitle="Active candidates"
        />
        <StatCard
          title="Total Hired"
          value={analytics.applicationStats.hiredApplications}
          icon={UserCheck}
          subtitle="Successful hires"
        />
      </div>

      {/* Conversion Rates */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <StatCard
          title="Screening Rate"
          value={`${analytics.conversionRates.screeningRate}%`}
          subtitle="New → Screening"
        />
        <StatCard
          title="Interview Rate"
          value={`${analytics.conversionRates.interviewRate}%`}
          subtitle="Screening → Interview"
        />
        <StatCard
          title="Offer Rate"
          value={`${analytics.conversionRates.offerRate}%`}
          subtitle="Interview → Offer"
        />
        <StatCard
          title="Hire Rate"
          value={`${analytics.conversionRates.hireRate}%`}
          subtitle="Offer → Hired"
        />
      </div>

      {/* Application Funnel */}
      <div className="mb-8">
        <ConversionFunnel stages={funnelStages} />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Top Jobs */}
        <TopJobsTable jobs={analytics.topJobs} />

        {/* Recent Activity */}
        <RecentActivity activities={analytics.recentActivity} />
      </div>

      {/* Tips Section */}
      <div className="mt-8 rounded-lg border bg-muted/50 p-6">
        <h3 className="font-semibold mb-3">💡 Tips to Improve Your Metrics</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            • <strong>Low screening rate?</strong> Review your job descriptions to attract more
            qualified candidates
          </li>
          <li>
            • <strong>High rejection rate?</strong> Consider adjusting job requirements or salary
            expectations
          </li>
          <li>
            • <strong>Slow hiring?</strong> Streamline your interview process to move candidates
            faster
          </li>
          <li>
            • <strong>Few applications?</strong> Try posting jobs in multiple countries or
            adjusting filters
          </li>
        </ul>
      </div>
    </div>
  );
}
