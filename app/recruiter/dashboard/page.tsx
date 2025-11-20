import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, Eye, MessageSquare, TrendingUp, Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Recruiter Dashboard',
  description: 'Manage your job postings and candidates',
};

export default async function RecruiterDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/recruiter/dashboard');
  }

  if (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const stats = {
    activeJobs: 12,
    totalApplications: 247,
    totalViews: 1543,
    messagesUnread: 8,
    avgResponseRate: 78,
    hiringRate: 15,
  };

  const recentJobs = [
    {
      id: 1,
      title: 'ESL Teacher',
      location: 'Seoul, South Korea',
      status: 'ACTIVE',
      applications: 45,
      views: 234,
      posted: '2025-01-15'
    },
    {
      id: 2,
      title: 'Math Teacher',
      location: 'Tokyo, Japan',
      status: 'ACTIVE',
      applications: 32,
      views: 187,
      posted: '2025-01-10'
    },
    {
      id: 3,
      title: 'Science Teacher',
      location: 'Singapore',
      status: 'DRAFT',
      applications: 0,
      views: 0,
      posted: '2025-01-20'
    },
  ];

  const recentApplications = [
    {
      id: 1,
      candidateName: 'John Doe',
      jobTitle: 'ESL Teacher',
      appliedDate: '2 hours ago',
      status: 'NEW'
    },
    {
      id: 2,
      candidateName: 'Jane Smith',
      jobTitle: 'Math Teacher',
      appliedDate: '5 hours ago',
      status: 'REVIEWED'
    },
    {
      id: 3,
      candidateName: 'Mike Johnson',
      jobTitle: 'ESL Teacher',
      appliedDate: '1 day ago',
      status: 'SHORTLISTED'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Recruiter Dashboard</h1>
            <p className="text-muted-foreground">Manage your job postings and track applications</p>
          </div>
          <Link href="/recruiter/jobs/create">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Post New Job
            </Button>
          </Link>
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
