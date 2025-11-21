import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/ui/logout-button';
import { Briefcase, Users, Eye, MessageSquare, TrendingUp, Plus, ArrowUp, ArrowDown, Minus } from 'lucide-react';

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
  const { getDashboardStats, getRecentJobs, getRecentApplications, getHiringFunnelData, getPerformanceBenchmarks } = await import('@/app/actions/dashboard-stats');
  const { getTopRatedCandidates, getMatchQualityMetrics, getVisaEligibilityMetrics } = await import('@/app/actions/ai-metrics');
  const { calculateOverallScore, getScoreColor, getScoreCategory } = await import('@/lib/utils/ai-score');

  const [stats, recentJobs, recentApplications, topCandidates, matchMetrics, visaMetrics, funnelData, benchmarks] = await Promise.all([
    getDashboardStats(),
    getRecentJobs(),
    getRecentApplications(),
    getTopRatedCandidates(6).catch(() => []),
    getMatchQualityMetrics().catch(() => ({ averageSimilarityScore: 0, totalMatches: 0, emailsSent: 0, emailsDelivered: 0, matchesPerJob: [] })),
    getVisaEligibilityMetrics().catch(() => ({ totalApplications: 0, eligibleCount: 0, ineligibleCount: 0, byCountry: [] })),
    getHiringFunnelData(),
    getPerformanceBenchmarks(),
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

        {/* Hiring Funnel Analytics - Phase 3 */}
        {funnelData.totalApplications > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Hiring Funnel Analytics</CardTitle>
              <CardDescription>Track candidate progression through your hiring stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-6 gap-4">
                  {/* NEW */}
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-blue-100 rounded-t-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-900">{funnelData.newApplications}</div>
                      <div className="text-xs text-blue-700 mt-1">NEW</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {funnelData.totalApplications > 0 ? Math.round((funnelData.newApplications / funnelData.totalApplications) * 100) : 0}%
                    </div>
                  </div>

                  {/* SCREENING */}
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-purple-100 rounded-lg p-4 text-center" style={{ width: '90%' }}>
                      <div className="text-2xl font-bold text-purple-900">{funnelData.screening}</div>
                      <div className="text-xs text-purple-700 mt-1">SCREENING</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {funnelData.newApplications > 0 ? Math.round((funnelData.screening / funnelData.newApplications) * 100) : 0}% conversion
                    </div>
                  </div>

                  {/* INTERVIEW */}
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-indigo-100 rounded-lg p-4 text-center" style={{ width: '80%' }}>
                      <div className="text-2xl font-bold text-indigo-900">{funnelData.interview}</div>
                      <div className="text-xs text-indigo-700 mt-1">INTERVIEW</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {funnelData.screening > 0 ? Math.round((funnelData.interview / funnelData.screening) * 100) : 0}% conversion
                    </div>
                  </div>

                  {/* OFFER */}
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-green-100 rounded-lg p-4 text-center" style={{ width: '70%' }}>
                      <div className="text-2xl font-bold text-green-900">{funnelData.offer}</div>
                      <div className="text-xs text-green-700 mt-1">OFFER</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {funnelData.interview > 0 ? Math.round((funnelData.offer / funnelData.interview) * 100) : 0}% conversion
                    </div>
                  </div>

                  {/* HIRED */}
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-emerald-100 rounded-lg p-4 text-center" style={{ width: '60%' }}>
                      <div className="text-2xl font-bold text-emerald-900">{funnelData.hired}</div>
                      <div className="text-xs text-emerald-700 mt-1">HIRED</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {funnelData.offer > 0 ? Math.round((funnelData.hired / funnelData.offer) * 100) : 0}% conversion
                    </div>
                  </div>

                  {/* REJECTED */}
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-red-100 rounded-lg p-4 text-center border-2 border-red-300">
                      <div className="text-2xl font-bold text-red-900">{funnelData.rejected}</div>
                      <div className="text-xs text-red-700 mt-1">REJECTED</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {funnelData.totalApplications > 0 ? Math.round((funnelData.rejected / funnelData.totalApplications) * 100) : 0}% of total
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Overall Conversion</div>
                    <div className="text-xl font-bold mt-1">
                      {funnelData.newApplications > 0 ? Math.round((funnelData.hired / funnelData.newApplications) * 100) : 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">NEW → HIRED</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Total Applications</div>
                    <div className="text-xl font-bold mt-1">{funnelData.totalApplications}</div>
                    <div className="text-xs text-muted-foreground">All statuses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Active Pipeline</div>
                    <div className="text-xl font-bold mt-1">
                      {funnelData.newApplications + funnelData.screening + funnelData.interview + funnelData.offer}
                    </div>
                    <div className="text-xs text-muted-foreground">In progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                    <div className="text-xl font-bold mt-1 text-green-600">
                      {funnelData.totalApplications > 0 ? Math.round((funnelData.hired / funnelData.totalApplications) * 100) : 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Hired / Total</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Benchmarks - Phase 3 */}
        {benchmarks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Performance Benchmarks</CardTitle>
              <CardDescription>Compare your metrics against platform averages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {benchmarks.map((benchmark, index) => {
                  const isAboveAverage = benchmark.schoolValue >= benchmark.platformAverage;
                  const TrendIcon = benchmark.trend === 'up' ? ArrowUp : benchmark.trend === 'down' ? ArrowDown : Minus;
                  const trendColor = benchmark.trend === 'up' ? 'text-green-600' : benchmark.trend === 'down' ? 'text-red-600' : 'text-gray-600';

                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-muted-foreground">{benchmark.metric}</h3>
                        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">
                              {benchmark.schoolValue}
                            </span>
                            <span className="text-sm text-muted-foreground">{benchmark.unit}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Your Performance</p>
                        </div>

                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Platform Avg:</span>
                            <span className="font-semibold">
                              {benchmark.platformAverage} {benchmark.unit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-muted-foreground">Percentile:</span>
                            <span className={`font-semibold ${isAboveAverage ? 'text-green-600' : 'text-orange-600'}`}>
                              {benchmark.percentile}th
                            </span>
                          </div>
                        </div>

                        <div className="relative pt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${isAboveAverage ? 'bg-green-500' : 'bg-orange-500'}`}
                              style={{ width: `${Math.min(benchmark.percentile, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {isAboveAverage ? (
                          <p className="text-xs text-green-600 font-medium">
                            Above average performance
                          </p>
                        ) : (
                          <p className="text-xs text-orange-600 font-medium">
                            Room for improvement
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

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
