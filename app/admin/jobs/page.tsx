import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, Edit, Trash2, Flag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Job Management',
  description: 'Manage all job postings',
};

export default async function AdminJobsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const jobs = [
    { id: 1, title: 'ESL Teacher', school: 'Seoul International', status: 'ACTIVE', flagged: false, posted: '2025-01-20' },
    { id: 2, title: 'Math Teacher', school: 'Tokyo Academy', status: 'ACTIVE', flagged: true, posted: '2025-01-19' },
    { id: 3, title: 'Science Teacher', school: 'Singapore School', status: 'DRAFT', flagged: false, posted: '2025-01-18' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Job Management</h1>
          <p className="text-muted-foreground">Manage and moderate all job postings</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Search jobs..." className="pl-10" />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="flagged">Flagged ({jobs.filter(j => j.flagged).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                        {job.flagged && <Flag className="h-4 w-4 text-red-600" />}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>{job.school}</span>
                        <span className="mx-2">•</span>
                        <span>Posted {job.posted}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="flagged">
            <p className="text-muted-foreground">Flagged jobs appear here</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
