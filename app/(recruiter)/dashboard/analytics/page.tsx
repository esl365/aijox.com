import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Briefcase, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'View your recruitment analytics and metrics',
};

/**
 * Recruiter Dashboard v1 - Task 2.2
 * Basic analytics showing total applicants, views, and recent applications
 */
export default async function AnalyticsDashboardPage() {
  // TODO: Fetch real data from database
  const stats = {
    totalApplicants: 127,
    totalViews: 1453,
    activeJobs: 12,
    applicantsTrend: '+18%',
  };

  const recentApplications = [
    { id: '1', name: 'John Doe', jobTitle: 'ESL Teacher', appliedAt: '2 hours ago' },
    { id: '2', name: 'Jane Smith', jobTitle: 'Math Teacher', appliedAt: '5 hours ago' },
    { id: '3', name: 'Bob Johnson', jobTitle: 'Science Teacher', appliedAt: '1 day ago' },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track your recruitment performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplicants}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">{stats.applicantsTrend}</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">Across all job postings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">Currently hiring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Applicants/Job</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalApplicants / stats.activeJobs).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Per job posting</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Latest candidates who applied to your jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{app.name}</p>
                  <p className="text-sm text-muted-foreground">{app.jobTitle}</p>
                </div>
                <p className="text-sm text-muted-foreground">{app.appliedAt}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
