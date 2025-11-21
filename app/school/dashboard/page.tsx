import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/ui/logout-button';
import { Briefcase, Users, Eye, MessageSquare, TrendingUp, Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'School Dashboard',
  description: 'Manage your job postings and candidates',
};

export default async function SchoolDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/school/dashboard');
  }

  if (session.user.role !== 'SCHOOL' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Auto-create school profile if it doesn't exist (for seeded users)
  if (session.user.role === 'SCHOOL') {
    const { prisma } = await import('@/lib/db');
    const existingProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      // Create a basic profile for seeded school users
      await prisma.schoolProfile.create({
        data: {
          userId: session.user.id,
          schoolName: session.user.name || 'School',
          country: 'South Korea',
          city: 'Seoul',
          schoolType: 'International School',
          isVerified: true,
          verifiedAt: new Date(),
        },
      });
    }
  }

  // Fetch all dashboard data in parallel using server actions
  const { getDashboardStats, getRecentJobs, getRecentApplications } = await import('@/app/actions/dashboard-stats');
  const { getTopRatedCandidates, getMatchQualityMetrics, getVisaEligibilityMetrics } = await import('@/app/actions/ai-metrics');
  const { calculateOverallScore, getScoreColor, getScoreCategory } = await import('@/lib/utils/ai-score');

  const [stats, recentJobs, recentApplications, topCandidates, matchMetrics, visaMetrics] = await Promise.all([
    getDashboardStats(),
    getRecentJobs(),
    getRecentApplications(),
    getTopRatedCandidates(6).catch(() => []),
    getMatchQualityMetrics().catch(() => ({ averageSimilarityScore: 0, totalMatches: 0, emailsSent: 0, emailsDelivered: 0, matchesPerJob: [] })),
    getVisaEligibilityMetrics().catch(() => ({ totalApplications: 0, eligibleCount: 0, ineligibleCount: 0, byCountry: [] })),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">School Dashboard</h1>
            <p className="text-muted-foreground">Manage your job postings and track applications</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/recruiter/jobs/create">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Post New Job
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently posted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Job impressions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messagesUnread}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average response rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hiring Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hiringRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Successful hires
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI-Powered Insights Section - Phase 2 */}
        {(topCandidates.length > 0 || matchMetrics.totalMatches > 0 || visaMetrics.totalApplications > 0) && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">AI-Powered Insights</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Agent 1: AI Screener - Top Rated Candidates */}
              {topCandidates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Top-Rated Candidates</CardTitle>
                    <CardDescription>AI video analysis scores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topCandidates.slice(0, 3).map((candidate) => (
                        <div key={candidate.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                          <div className="flex-1">
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground">{candidate.appliedFor}</p>
                          </div>
                          <div className={`text-right ${getScoreColor(candidate.overallScore)}`}>
                            <p className="font-bold">{candidate.overallScore}</p>
                            <p className="text-xs">{getScoreCategory(candidate.overallScore)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Agent 2: Headhunter - Match Quality */}
              {matchMetrics.totalMatches > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Job Matching Performance</CardTitle>
                    <CardDescription>Automated headhunter metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Matches:</span>
                        <span className="font-semibold">{matchMetrics.totalMatches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Similarity:</span>
                        <span className="font-semibold">{(matchMetrics.averageSimilarityScore * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Emails Sent:</span>
                        <span className="font-semibold">{matchMetrics.emailsSent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivered:</span>
                        <span className="font-semibold">{matchMetrics.emailsDelivered}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Agent 3: Visa Guard - Eligibility Overview */}
              {visaMetrics.totalApplications > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Visa Eligibility Status</CardTitle>
                    <CardDescription>Compliance tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Applications:</span>
                        <span className="font-semibold">{visaMetrics.totalApplications}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Eligible:</span>
                        <span className="font-semibold text-green-600">{visaMetrics.eligibleCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Ineligible:</span>
                        <span className="font-semibold text-red-600">{visaMetrics.ineligibleCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Eligibility Rate:</span>
                        <span className="font-semibold">
                          {((visaMetrics.eligibleCount / visaMetrics.totalApplications) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Job Postings</CardTitle>
              <CardDescription>Your latest job listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{job.applications} applications</span>
                        <span>•</span>
                        <span>{job.views} views</span>
                        <span>•</span>
                        <span>Posted {job.posted}</span>
                      </div>
                    </div>
                    <Link href={`/recruiter/jobs/${job.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
                <Link href="/recruiter/jobs">
                  <Button variant="outline" className="w-full">
                    View All Jobs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest candidate applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{application.candidateName}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{application.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">Applied {application.appliedDate}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                ))}
                <Link href="/recruiter/applications">
                  <Button variant="outline" className="w-full">
                    View All Applications
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
