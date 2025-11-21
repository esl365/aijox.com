import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Calendar, ArrowLeft, Clock, Trash2 } from 'lucide-react';
import { getReports } from '@/app/actions/reports';
import { DeleteReportButton } from '@/components/school/DeleteReportButton';

export const metadata: Metadata = {
  title: 'Reports',
  description: 'Manage custom reports and analytics',
};

export default async function ReportsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/school/reports');
  }

  if (session.user.role !== 'SCHOOL' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const result = await getReports();
  const reports = result.success ? result.reports : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/school/dashboard">
              <Button variant="ghost" size="sm" className="mb-2 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">Reports</h1>
            <p className="text-muted-foreground">Create and manage custom analytics reports</p>
          </div>
          <Link href="/school/reports/create">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create Report
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Custom reports created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter((r) => r.isScheduled).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Automated delivery
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recently Generated</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter((r) => r.lastGeneratedAt).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                With generated data
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Reports</CardTitle>
            <CardDescription>
              View and manage your custom reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first custom report to track important metrics
                </p>
                <Link href="/school/reports/create">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Report
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{report.name}</h3>
                        <Badge variant="outline">{report.reportType}</Badge>
                        {report.isScheduled && (
                          <Badge variant="secondary">
                            <Calendar className="h-3 w-3 mr-1" />
                            {report.scheduleFrequency}
                          </Badge>
                        )}
                      </div>
                      {report.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {report.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created by {report.createdBy.name}</span>
                        <span>•</span>
                        <span>
                          Created {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                        {report.lastGeneratedAt && (
                          <>
                            <span>•</span>
                            <span>
                              Last generated {new Date(report.lastGeneratedAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Generate
                      </Button>
                      <DeleteReportButton reportId={report.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Report Types Available</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-green-800 space-y-2">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Applications Report:</strong> Track application volume, sources, and conversion rates
              </li>
              <li>
                <strong>Diversity Report:</strong> Analyze candidate demographics and hiring diversity
              </li>
              <li>
                <strong>Source Effectiveness:</strong> Measure performance of different recruitment channels
              </li>
              <li>
                <strong>Custom Report:</strong> Build reports with custom metrics and filters
              </li>
            </ul>
            <p className="pt-2">
              Schedule reports for automated delivery on a daily, weekly, or monthly basis.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
