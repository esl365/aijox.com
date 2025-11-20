import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getJobsRequiringReview, approveJobPosting, getExtractionCacheStats } from '@/app/actions/job-extraction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Extraction Review Queue - Admin',
  description: 'Review job postings with low AI extraction confidence',
};

export default async function AdminReviewQueuePage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [jobsToReview, cacheStats] = await Promise.all([
    getJobsRequiringReview(),
    getExtractionCacheStats(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">AI Extraction Review Queue</h1>
          <p className="text-muted-foreground">
            Review job postings with low AI extraction confidence
          </p>
        </div>

        {/* Cache Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Cached Extractions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cacheStats.totalCached}</div>
              <p className="text-xs text-muted-foreground">Total cache entries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cacheStats.totalHits}</div>
              <p className="text-xs text-muted-foreground">Reused extractions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(cacheStats.avgConfidence * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Extraction accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{jobsToReview.length}</div>
              <p className="text-xs text-muted-foreground">Jobs flagged</p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Requiring Review */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Jobs Requiring Review</h2>

          {jobsToReview.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <p className="text-lg font-medium mb-2">All Clear!</p>
                <p className="text-muted-foreground">
                  No job postings require manual review at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            jobsToReview.map((job) => (
              <Card key={job.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{job.title}</CardTitle>
                      <CardDescription>
                        {job.schoolName || job.school?.schoolName} • {job.city}, {job.country}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Needs Review
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Extraction Info */}
                  {job.aiExtractionScore !== null && (
                    <Alert variant={job.aiExtractionScore >= 0.7 ? 'default' : 'destructive'}>
                      <TrendingUp className="h-4 w-4" />
                      <AlertTitle>
                        AI Extraction Confidence: {Math.round(job.aiExtractionScore * 100)}%
                      </AlertTitle>
                      {job.aiExtractionErrors.length > 0 && (
                        <AlertDescription>
                          <p className="font-medium mt-2">Extraction Errors:</p>
                          <ul className="list-disc list-inside mt-1">
                            {job.aiExtractionErrors.map((error, idx) => (
                              <li key={idx} className="text-sm">{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      )}
                    </Alert>
                  )}

                  {/* Quick Info */}
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Salary</p>
                      <p className="text-muted-foreground">${job.salaryUSD.toLocaleString()}/mo</p>
                    </div>
                    <div>
                      <p className="font-medium">Subject</p>
                      <p className="text-muted-foreground">{job.subject}</p>
                    </div>
                    <div>
                      <p className="font-medium">Status</p>
                      <p className="text-muted-foreground">{job.status}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Link href={`/jobs/${job.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Job Posting
                      </Button>
                    </Link>
                    <form action={async () => {
                      'use server';
                      await approveJobPosting(job.id);
                    }}>
                      <Button type="submit" className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Approve & Clear Flag
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
