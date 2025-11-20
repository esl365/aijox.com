import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, CheckCircle, XCircle, Flag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reports Management',
  description: 'Manage user reports and flags',
};

export default async function AdminReportsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const reports = [
    {
      id: 1,
      type: 'job',
      target: 'ESL Teacher - Seoul International',
      reason: 'Misleading job description',
      reporter: 'john.doe@example.com',
      status: 'PENDING',
      date: '2025-01-20'
    },
    {
      id: 2,
      type: 'school',
      target: 'Tokyo Academy',
      reason: 'Suspicious verification documents',
      reporter: 'jane.smith@example.com',
      status: 'PENDING',
      date: '2025-01-19'
    },
    {
      id: 3,
      type: 'user',
      target: 'User Profile: Mike Johnson',
      reason: 'Inappropriate profile content',
      reporter: 'admin@example.com',
      status: 'REVIEWED',
      date: '2025-01-18'
    },
    {
      id: 4,
      type: 'job',
      target: 'Math Teacher - Singapore School',
      reason: 'Discriminatory requirements',
      reporter: 'sarah.lee@example.com',
      status: 'REVIEWED',
      date: '2025-01-17'
    },
  ];

  const pendingReports = reports.filter(r => r.status === 'PENDING');
  const reviewedReports = reports.filter(r => r.status === 'REVIEWED');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Reports Management</h1>
          <p className="text-muted-foreground">Review and manage user reports and flags</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Search reports..." className="pl-10" />
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingReports.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed ({reviewedReports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Flag className="h-4 w-4 text-red-600" />
                        <h3 className="font-semibold text-lg">{report.target}</h3>
                        <Badge variant="secondary">{report.type.toUpperCase()}</Badge>
                        <Badge variant="destructive">{report.status}</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium">Reason:</span> {report.reason}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Reporter:</span> {report.reporter}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Reported:</span> {report.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-4 mt-6">
            {reviewedReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{report.target}</h3>
                        <Badge variant="secondary">{report.type.toUpperCase()}</Badge>
                        <Badge variant="outline">{report.status}</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium">Reason:</span> {report.reason}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Reporter:</span> {report.reporter}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Reported:</span> {report.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
