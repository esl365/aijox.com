import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getApplicationById } from '@/app/actions/applications';
import { ApplicationTimeline } from '@/components/applications/ApplicationTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const application = await getApplicationById(id);

  if (!application) {
    return {
      title: 'Application Not Found',
    };
  }

  return {
    title: `Application for ${application.job.title}`,
    description: `Track your application to ${application.job.schoolName}`,
  };
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== 'TEACHER') {
    redirect('/login?callbackUrl=/applications');
  }

  const application = await getApplicationById(id);

  if (!application) {
    notFound();
  }

  const { job } = application;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          {' / '}
          <Link href="/applications" className="hover:text-foreground">
            Applications
          </Link>
          {' / '}
          <span className="text-foreground">{job.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <Link href="/applications">
            <Button variant="ghost" className="mb-4">
              ← Back to Applications
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">{job.title}</h1>
          <p className="text-xl text-muted-foreground">
            {job.schoolName} • {job.city}, {job.country}
          </p>
        </div>

        {/* Application Timeline */}
        <div className="mb-8">
          <ApplicationTimeline
            status={application.status}
            createdAt={application.createdAt}
            viewedAt={application.viewedAt}
            screenedAt={application.screenedAt}
            interviewedAt={application.interviewedAt}
            offeredAt={application.offeredAt}
            hiredAt={application.hiredAt}
            rejectedAt={application.rejectedAt}
            rejectReason={application.rejectReason}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Job Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Job Information */}
            <Card>
              <CardHeader>
                <CardTitle>Position Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Subject</p>
                    <p className="font-medium">{job.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">
                      {job.city}, {job.country}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Salary</p>
                    <p className="font-medium">
                      ${job.salaryUSD.toLocaleString()}/month
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Contract Length
                    </p>
                    <p className="font-medium">
                      {job.contractLength
                        ? `${job.contractLength} months`
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                {(job.housingProvided || job.flightProvided) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Benefits Included
                    </p>
                    <div className="flex gap-2">
                      {job.housingProvided && (
                        <Badge variant="secondary">🏠 Housing Provided</Badge>
                      )}
                      {job.flightProvided && (
                        <Badge variant="secondary">✈️ Flight Provided</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Job Description
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>

                {/* Requirements */}
                {job.requirements && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Requirements
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {job.requirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Your Cover Letter */}
            {application.coverLetter && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">
                    {application.coverLetter}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Match Score */}
            {application.aiMatchScore !== null &&
              application.aiMatchScore !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Match Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {application.aiMatchScore}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on your profile and job requirements
                      </p>
                      <div className="mt-4 w-full bg-muted rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all"
                          style={{ width: `${application.aiMatchScore}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/jobs/${job.id}`} className="block">
                  <Button variant="outline" className="w-full">
                    View Full Job Posting
                  </Button>
                </Link>
                <Link href="/applications" className="block">
                  <Button variant="outline" className="w-full">
                    View All Applications
                  </Button>
                </Link>
                <Link href="/jobs" className="block">
                  <Button className="w-full">Browse More Jobs</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Have questions about your application or the hiring process?
                </p>
                <Link href="/support">
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
