import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getAdminAnalytics } from '@/app/actions/analytics';
import { StatCard } from '@/components/analytics/StatCard';
import {
  Users,
  Briefcase,
  Building2,
  FileText,
  TrendingUp,
  Video,
  Star,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Platform Analytics | Admin Dashboard',
  description: 'View platform-wide analytics and growth metrics.',
};

export default async function AdminAnalyticsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const analytics = await getAdminAnalytics();

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No Analytics Available</h1>
          <p className="mt-2 text-muted-foreground">Unable to load platform analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor platform-wide growth, engagement, and performance
        </p>
      </div>

      {/* Platform Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Teachers"
            value={analytics.platformStats.totalTeachers.toLocaleString()}
            icon={Users}
            subtitle="Registered educators"
          />
          <StatCard
            title="Total Recruiters"
            value={analytics.platformStats.totalRecruiters.toLocaleString()}
            icon={Building2}
            subtitle="Active recruiters"
          />
          <StatCard
            title="Total Schools"
            value={analytics.platformStats.totalSchools.toLocaleString()}
            icon={Building2}
            subtitle="School profiles"
          />
          <StatCard
            title="Total Jobs"
            value={analytics.platformStats.totalJobs.toLocaleString()}
            icon={Briefcase}
            subtitle="All job postings"
          />
          <StatCard
            title="Total Applications"
            value={analytics.platformStats.totalApplications.toLocaleString()}
            icon={FileText}
            subtitle="Total submissions"
          />
          <StatCard
            title="Approved Reviews"
            value={analytics.platformStats.totalReviews.toLocaleString()}
            icon={Star}
            subtitle="Published reviews"
          />
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Growth Metrics</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="New Teachers"
            value={analytics.growthMetrics.newTeachersThisMonth}
            icon={Users}
            subtitle="This month"
            trend={{
              value: analytics.growthMetrics.teacherGrowthRate,
              isPositive: analytics.growthMetrics.teacherGrowthRate >= 0,
            }}
          />
          <StatCard
            title="New Jobs"
            value={analytics.growthMetrics.newJobsThisMonth}
            icon={Briefcase}
            subtitle="This month"
            trend={{
              value: analytics.growthMetrics.jobGrowthRate,
              isPositive: analytics.growthMetrics.jobGrowthRate >= 0,
            }}
          />
          <StatCard
            title="New Applications"
            value={analytics.growthMetrics.newApplicationsThisMonth}
            icon={FileText}
            subtitle="This month"
          />
          <StatCard
            title="Teacher Growth"
            value={`${analytics.growthMetrics.teacherGrowthRate}%`}
            icon={TrendingUp}
            subtitle="Month over month"
          />
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Engagement Metrics</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Avg Profile Completeness"
            value={`${analytics.engagementMetrics.avgProfileCompleteness}%`}
            icon={Users}
            subtitle="Teacher profiles"
          />
          <StatCard
            title="Teachers with Videos"
            value={analytics.engagementMetrics.teachersWithVideos}
            icon={Video}
            subtitle={`${((analytics.engagementMetrics.teachersWithVideos / analytics.platformStats.totalTeachers) * 100).toFixed(1)}% of total`}
          />
          <StatCard
            title="Active Jobs"
            value={analytics.engagementMetrics.activeJobs}
            icon={Briefcase}
            subtitle="Currently hiring"
          />
          <StatCard
            title="Application Rate"
            value={analytics.engagementMetrics.applicationRate.toFixed(1)}
            icon={FileText}
            subtitle="Applications per job"
          />
        </div>
      </div>

      {/* Top Countries */}
      <div className="mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Top Countries by Job Demand</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Country
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    Job Postings
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    Applications
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    Avg Applications
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.topCountries.map((country, index) => {
                  const avgApplications =
                    country.jobCount > 0
                      ? (country.applicationCount / country.jobCount).toFixed(1)
                      : '0';

                  return (
                    <tr key={country.country} className="border-b last:border-0">
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{country.country}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                          {country.jobCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                          {country.applicationCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">
                        {avgApplications}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Platform Health Indicators */}
      <div className="rounded-lg border bg-muted/50 p-6">
        <h3 className="font-semibold mb-3">📊 Platform Health Indicators</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium mb-2">Positive Signals</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analytics.growthMetrics.teacherGrowthRate > 0 && (
                <li>✅ Teacher growth trending upward ({analytics.growthMetrics.teacherGrowthRate}%)</li>
              )}
              {analytics.growthMetrics.jobGrowthRate > 0 && (
                <li>✅ Job postings increasing ({analytics.growthMetrics.jobGrowthRate}%)</li>
              )}
              {analytics.engagementMetrics.avgProfileCompleteness > 70 && (
                <li>✅ High profile completion rate ({analytics.engagementMetrics.avgProfileCompleteness}%)</li>
              )}
              {analytics.engagementMetrics.applicationRate > 5 && (
                <li>✅ Strong application rate ({analytics.engagementMetrics.applicationRate} per job)</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Areas for Improvement</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analytics.growthMetrics.teacherGrowthRate < 0 && (
                <li>⚠️ Teacher growth declining - consider marketing campaigns</li>
              )}
              {analytics.engagementMetrics.avgProfileCompleteness < 70 && (
                <li>⚠️ Low profile completion - improve onboarding flow</li>
              )}
              {((analytics.engagementMetrics.teachersWithVideos / analytics.platformStats.totalTeachers) * 100) < 50 && (
                <li>⚠️ Low video adoption - encourage video resume creation</li>
              )}
              {analytics.engagementMetrics.applicationRate < 3 && (
                <li>⚠️ Low application rate - review job quality and matching</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
