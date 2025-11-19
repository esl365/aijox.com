'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JobPosting } from '@prisma/client';
import type { Session } from 'next-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { validateJobApplication } from '@/app/actions/visa-validation';
import { useToast } from '@/hooks/use-toast';
import { SimilarJobs } from '@/components/jobs/SimilarJobs';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { VerifiedBadge } from '@/components/badges/VerifiedBadge';
import type { ReviewWithAuthor } from '@/app/actions/reviews';

type JobDetailClientProps = {
  job: JobPosting & {
    school: { isVerified: boolean; verifiedAt: Date | null } | null;
    recruiter: { isVerified: boolean; verifiedAt: Date | null } | null;
  };
  session: Session | null;
  reviews: ReviewWithAuthor[];
  reviewStats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  };
};

export function JobDetailClient({
  job,
  session,
  reviews,
  reviewStats,
}: JobDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [applying, setApplying] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not specified';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const handleApply = async () => {
    if (!session) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to apply for this job',
        variant: 'destructive',
      });
      router.push(`/login?callbackUrl=/jobs/${job.id}`);
      return;
    }

    if (session.user.role !== 'TEACHER') {
      toast({
        title: 'Teacher Account Required',
        description: 'Only teacher accounts can apply for jobs',
        variant: 'destructive',
      });
      return;
    }

    setApplying(true);

    // Validate job application (includes visa check)
    const result = await validateJobApplication(
      session.user.teacherProfileId!,
      job.id
    );

    setValidationResult(result);

    if (!result.canApply) {
      toast({
        title: 'Cannot Apply',
        description: result.reason,
        variant: 'destructive',
      });
      setApplying(false);
      return;
    }

    // Navigate to application form
    router.push(`/jobs/${job.id}/apply`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => router.back()}
            >
              ← Back to Jobs
            </Button>

            <h1 className="text-4xl font-bold mb-4">{job.title}</h1>

            <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="flex items-center gap-2">
                  {job.schoolName}
                  {(job.school?.isVerified || job.recruiter?.isVerified) && (
                    <VerifiedBadge size="sm" variant="compact" />
                  )}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.city}, {job.country}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary" className="text-base px-3 py-1">
                {job.subject}
              </Badge>
              {job.minYearsExperience && (
                <Badge variant="outline" className="text-base px-3 py-1">
                  {job.minYearsExperience}+ years experience
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div>
                <p className="text-3xl font-bold text-primary">
                  {formatSalary(job.salaryUSD)}
                </p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
              <Button size="lg" onClick={handleApply} disabled={applying}>
                {applying ? 'Checking Eligibility...' : 'Apply Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl grid gap-6">
          {/* Validation Result */}
          {validationResult && !validationResult.canApply && (
            <Alert variant="destructive">
              <AlertTitle>Cannot Apply</AlertTitle>
              <AlertDescription>{validationResult.reason}</AlertDescription>
              {validationResult.visaDetails && (
                <div className="mt-4 space-y-2">
                  <p className="font-semibold">Failed Requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.visaDetails.failedRequirements.map(
                      (req: any, idx: number) => (
                        <li key={idx} className="text-sm">
                          {req.message}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </Alert>
          )}

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Benefits & Compensation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      job.housingProvided
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Housing</p>
                    <p className="text-sm text-muted-foreground">
                      {job.housingProvided ? 'Provided' : 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      job.flightProvided
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Flight</p>
                    <p className="text-sm text-muted-foreground">
                      {job.flightProvided ? 'Provided' : 'Not provided'}
                    </p>
                  </div>
                </div>

                {job.contractLength && (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Contract</p>
                      <p className="text-sm text-muted-foreground">
                        {job.contractLength} months
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {job.benefits && (
                <div className="pt-4 border-t">
                  <p className="font-medium mb-2">Additional Benefits:</p>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {job.benefits}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-muted-foreground">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.minYearsExperience && (
                <div>
                  <p className="font-medium">Experience:</p>
                  <p className="text-muted-foreground">
                    Minimum {job.minYearsExperience} years of teaching experience
                  </p>
                </div>
              )}

              {job.requiredSubjects && job.requiredSubjects.length > 0 && (
                <div>
                  <p className="font-medium">Subjects:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.requiredSubjects.map((subject, idx) => (
                      <Badge key={idx} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {job.requirements && (
                <div>
                  <p className="font-medium mb-2">Additional Requirements:</p>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {job.requirements}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {job.startDate && (
                <div>
                  <span className="font-medium">Start Date: </span>
                  <span className="text-muted-foreground">
                    {formatDate(job.startDate)}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium">Location: </span>
                <span className="text-muted-foreground">
                  {job.city}, {job.country}
                </span>
              </div>
              {job.currency && job.currency !== 'USD' && (
                <div>
                  <span className="font-medium">Local Currency: </span>
                  <span className="text-muted-foreground">{job.currency}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Apply Button (Bottom) */}
          <Card className="bg-primary/5">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-lg font-semibold mb-1">Ready to apply?</p>
                <p className="text-sm text-muted-foreground">
                  We'll check your visa eligibility and guide you through the process
                </p>
              </div>
              <Button size="lg" onClick={handleApply} disabled={applying}>
                {applying ? 'Checking...' : 'Apply Now'}
              </Button>
            </CardContent>
          </Card>

          {/* Similar Jobs */}
          <SimilarJobs jobId={job.id} limit={3} className="mt-8" />

          {/* Reviews Section */}
          <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
              {session?.user.role === 'TEACHER' && !showReviewForm && (
                <Button onClick={() => setShowReviewForm(true)}>
                  Write a Review
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Stats Sidebar */}
              <Card>
                <CardHeader>
                  <CardTitle>Overall Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewStats
                    averageRating={reviewStats.averageRating}
                    totalReviews={reviewStats.totalReviews}
                    ratingDistribution={reviewStats.ratingDistribution}
                  />
                </CardContent>
              </Card>

              {/* Reviews List */}
              <div className="md:col-span-2 space-y-6">
                {/* Review Form */}
                {showReviewForm && session?.user.role === 'TEACHER' && (
                  <div>
                    <ReviewForm
                      reviewType="JOB_REVIEW"
                      jobId={job.id}
                      schoolId={job.schoolId || undefined}
                      jobTitle={job.title}
                      schoolName={job.schoolName}
                      onSuccess={() => {
                        setShowReviewForm(false);
                        router.refresh();
                      }}
                    />
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reviews */}
                {!showReviewForm && <ReviewList reviews={reviews} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
