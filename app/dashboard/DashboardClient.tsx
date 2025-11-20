'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { JobCard } from '@/components/jobs/JobCard';
import type { DashboardData } from '@/app/actions/dashboard';
import type { JobPosting } from '@prisma/client';

type DashboardClientProps = {
  data: DashboardData;
  recommendedJobs: JobPosting[];
  userName: string;
};

export function DashboardClient({ data, recommendedJobs, userName }: DashboardClientProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-500',
      SCREENING: 'bg-yellow-500',
      INTERVIEW: 'bg-purple-500',
      OFFER: 'bg-green-500',
      HIRED: 'bg-green-700',
      REJECTED: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your teaching job search
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Completeness Alert */}
        {data.profile.completeness < 100 && (
          <Alert className="mb-6">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-2">
                    Complete your profile to increase visibility ({data.profile.completeness}%)
                  </p>
                  {data.profile.missingFields.length > 0 && (
                    <p className="text-sm">
                      Missing: {data.profile.missingFields.join(', ')}
                    </p>
                  )}
                </div>
                <Link href="/profile/setup">
                  <Button>Complete Profile</Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Profile Completeness */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Profile Completeness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {data.profile.completeness}%
              </div>
              <Progress value={data.profile.completeness} className="h-2" />
            </CardContent>
          </Card>

          {/* Applications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.applications.total}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {data.applications.byStatus.NEW || 0} pending review
              </p>
            </CardContent>
          </Card>

          {/* Visa Eligibility */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Visa Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {data.visaStatus.eligible.length}/{data.visaStatus.totalCountries}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                countries eligible
              </p>
            </CardContent>
          </Card>

          {/* Matches Sent */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Job Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.stats.matchesSent}</div>
              <p className="text-sm text-muted-foreground mt-1">
                matches received
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Applications</CardTitle>
                  <Link href="/applications">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Track the status of your job applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.applications.recent.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No applications yet</p>
                    <Link href="/jobs">
                      <Button className="mt-4">Browse Jobs</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.applications.recent.slice(0, 5).map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <Link
                            href={`/jobs/${app.jobId}`}
                            className="hover:underline"
                          >
                            <h4 className="font-semibold">{app.job.title}</h4>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {app.job.schoolName} • {app.job.city}, {app.job.country}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          className={getStatusColor(app.status)}
                          variant="secondary"
                        >
                          {getStatusLabel(app.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Jobs */}
            {recommendedJobs.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recommended Jobs</CardTitle>
                    <Link href="/jobs">
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                  <CardDescription>
                    Jobs matching your profile and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {recommendedJobs.slice(0, 3).map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Visa Status */}
            <Card>
              <CardHeader>
                <CardTitle>Visa Eligibility</CardTitle>
                <CardDescription>
                  Countries where you're eligible to work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Eligible</span>
                      <span className="text-sm text-muted-foreground">
                        {data.visaStatus.eligible.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.visaStatus.eligible.slice(0, 5).map((country) => (
                        <Badge key={country} variant="secondary">
                          {country}
                        </Badge>
                      ))}
                      {data.visaStatus.eligible.length > 5 && (
                        <Badge variant="outline">
                          +{data.visaStatus.eligible.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {data.visaStatus.ineligible.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Need Improvement
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {data.visaStatus.ineligible.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.visaStatus.ineligible.slice(0, 3).map((item) => (
                          <Badge key={item.country} variant="outline">
                            {item.country}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link href="/visa-status">
                    <Button variant="outline" className="w-full">
                      View Full Status
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/jobs">
                  <Button variant="outline" className="w-full justify-start">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/profile/setup">
                  <Button variant="outline" className="w-full justify-start">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/applications">
                  <Button variant="outline" className="w-full justify-start">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    View Applications
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
