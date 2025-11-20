import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Manage Jobs',
  description: 'Manage your job postings',
};

export default async function RecruiterJobsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/recruiter/jobs');
  }

  if (session.user.role !== 'RECRUITER') {
    redirect('/dashboard');
  }

  const jobs = [
    { id: 1, title: 'ESL Teacher', status: 'ACTIVE', applications: 45, views: 234, posted: '2025-01-15' },
    { id: 2, title: 'Math Teacher', status: 'ACTIVE', applications: 32, views: 189, posted: '2025-01-10' },
    { id: 3, title: 'Science Teacher', status: 'DRAFT', applications: 0, views: 0, posted: '2025-01-20' },
    { id: 4, title: 'Music Teacher', status: 'CLOSED', applications: 67, views: 412, posted: '2024-12-01' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Job Postings</h1>
            <p className="text-muted-foreground">Manage your active and draft job postings</p>
          </div>
          <Link href="/recruiter/jobs/create">
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Postings</CardDescription>
              <CardTitle className="text-3xl">4</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Jobs</CardDescription>
              <CardTitle className="text-3xl text-green-600">2</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Applications</CardDescription>
              <CardTitle className="text-3xl">144</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Views</CardDescription>
              <CardTitle className="text-3xl">835</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Job List */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <Badge variant={
                        job.status === 'ACTIVE' ? 'default' :
                        job.status === 'DRAFT' ? 'secondary' :
                        'outline'
                      }>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {job.applications} applications
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {job.views} views
                      </div>
                      <div>Posted {job.posted}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/recruiter/jobs/${job.id}/edit`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
