'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JobPosting } from '@prisma/client';
import type { Session } from 'next-auth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validateJobApplication } from '@/app/actions/visa-validation';
import { useToast } from '@/hooks/use-toast';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import type { ReviewWithAuthor } from '@/app/actions/reviews';

// New Wellfound-style components
import {
  CompanyHeader,
  JobTitleHeader,
  JobInfoGrid,
  AboutJobSection,
  AboutCompanySection,
  SimilarJobsGrid,
  StickyApplyBar,
} from '@/components/job-details';

type JobDetailClientProps = {
  job: JobPosting & {
    school: {
      id: string;
      schoolName: string;
      description: string | null;
      city: string;
      country: string;
      website: string | null;
      schoolType: string | null;
      isVerified: boolean;
      verifiedAt: Date | null;
    } | null;
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
  const [validationResult, setValidationResult] = useState<{
    canApply: boolean;
    reason?: string;
    visaDetails?: {
      failedRequirements: Array<{ message: string }>;
    };
  } | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

  const handleSave = () => {
    if (!session) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to save this job',
        variant: 'destructive',
      });
      router.push(`/login?callbackUrl=/jobs/${job.id}`);
      return;
    }

    setIsSaved(!isSaved);
    toast({
      title: isSaved ? 'Removed from saved' : 'Job saved',
      description: isSaved
        ? 'This job has been removed from your saved jobs'
        : 'You can find this job in your saved jobs',
    });
  };

  // Build company data for components
  const companyData = job.school
    ? {
        id: job.school.id,
        name: job.school.schoolName,
        logo: null,
        isActivelyHiring: true,
        isVerified: job.school.isVerified,
        website: job.school.website,
        description: job.school.description,
        city: job.school.city,
        country: job.school.country,
        schoolType: job.school.schoolType,
      }
    : {
        id: job.schoolId || '',
        name: job.schoolName,
        logo: null,
        isActivelyHiring: true,
        isVerified: job.recruiter?.isVerified || false,
        website: null,
        description: null,
        city: job.city,
        country: job.country,
        schoolType: null,
      };

  return (
    <>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          onClick={() => router.back()}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Jobs
        </Button>

        {/* Company Header */}
        <CompanyHeader
          company={companyData}
          onSave={handleSave}
          onApply={handleApply}
          isSaved={isSaved}
          isApplying={applying}
        />

        {/* Job Title Header */}
        <JobTitleHeader
          title={job.title}
          salary={job.salaryUSD}
          location={`${job.city}, ${job.country}`}
          experienceYears={job.minYearsExperience}
          employmentType={job.employmentType || 'FULL_TIME'}
          subject={job.subject}
        />

        {/* Job Info Grid */}
        <JobInfoGrid
          contractLength={job.contractLength}
          startDate={job.startDate}
          location={{ city: job.city, country: job.country }}
          visaSponsorship={true}
          housingProvided={job.housingProvided}
          flightProvided={job.flightProvided}
          subjects={job.requiredSubjects || [job.subject]}
        />

        {/* Validation Result */}
        {validationResult && !validationResult.canApply && (
          <Alert variant="destructive" className="my-6">
            <AlertTitle>Cannot Apply</AlertTitle>
            <AlertDescription>{validationResult.reason}</AlertDescription>
            {validationResult.visaDetails && (
              <div className="mt-4 space-y-2">
                <p className="font-semibold">Failed Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationResult.visaDetails.failedRequirements.map(
                    (req, idx) => (
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

        {/* About the Job Section */}
        <AboutJobSection
          description={job.description}
          fullDescriptionHtml={job.fullDescriptionHtml}
          requirements={job.requirements}
          benefits={job.benefits}
          housingProvided={job.housingProvided}
          flightProvided={job.flightProvided}
          contractLength={job.contractLength}
        />

        {/* Application Instructions (if external) */}
        {(job.externalApplicationUrl || job.applicationInstructions) && (
          <div className="my-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Application Instructions
            </h3>
            {job.applicationInstructions && (
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4 whitespace-pre-line">
                {job.applicationInstructions}
              </p>
            )}
            {job.externalApplicationUrl && (
              <Button asChild className="w-full sm:w-auto">
                <a
                  href={job.externalApplicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply via External Link →
                </a>
              </Button>
            )}
          </div>
        )}

        {/* About the Company Section */}
        <AboutCompanySection company={companyData} />

        {/* Similar Jobs */}
        <SimilarJobsGrid jobId={job.id} limit={6} className="py-8" />

        {/* Reviews Section */}
        <section className="py-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reviews & Ratings
            </h2>
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
        </section>
      </main>

      {/* Sticky Apply Bar (Mobile) */}
      <StickyApplyBar
        salary={job.salaryUSD}
        onApply={handleApply}
        disabled={applying}
      />

      {/* Add padding at bottom for sticky bar on mobile */}
      <div className="h-20 lg:hidden" />
    </>
  );
}
