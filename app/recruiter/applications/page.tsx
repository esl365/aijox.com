import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, MessageCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Applications',
  description: 'Manage job applications',
};

export default async function RecruiterApplicationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/recruiter/applications');
  }

  if (session.user.role !== 'RECRUITER') {
    redirect('/dashboard');
  }

  const applications = [
    { id: 1, name: 'John Doe', job: 'ESL Teacher', status: 'pending', date: '2025-01-19', score: 85 },
    { id: 2, name: 'Sarah Smith', job: 'Math Teacher', status: 'shortlisted', date: '2025-01-18', score: 92 },
    { id: 3, name: 'Michael Brown', job: 'ESL Teacher', status: 'rejected', date: '2025-01-17', score: 68 },
    { id: 4, name: 'Emily Johnson', job: 'Science Teacher', status: 'pending', date: '2025-01-19', score: 78 },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Applications</h1>
          <p className="text-muted-foreground">Review and manage candidate applications</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All (4)</TabsTrigger>
            <TabsTrigger value="pending">Pending (2)</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted (1)</TabsTrigger>
            <TabsTrigger value="rejected">Rejected (1)</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{app.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{app.name}</h3>
                        <Badge variant={
                          app.status === 'shortlisted' ? 'default' :
                          app.status === 'pending' ? 'secondary' :
                          'outline'
                        }>
                          {app.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Applied for: {app.job}</span>
                        <span>•</span>
                        <span>Applied {app.date}</span>
                        <span>•</span>
                        <span>AI Score: {app.score}/100</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/applications/${app.id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      {app.status === 'pending' && (
                        <>
                          <Button size="icon" variant="default">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline">
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending">
            <p className="text-muted-foreground">Pending applications will appear here</p>
          </TabsContent>

          <TabsContent value="shortlisted">
            <p className="text-muted-foreground">Shortlisted candidates will appear here</p>
          </TabsContent>

          <TabsContent value="rejected">
            <p className="text-muted-foreground">Rejected applications will appear here</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
