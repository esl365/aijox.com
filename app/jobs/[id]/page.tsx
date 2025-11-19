import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getJobById } from '@/app/actions/jobs';
import { getJobReviews, getJobReviewStats } from '@/app/actions/reviews';
import { JobDetailClient } from './JobDetailClient';
import {
  generateGoogleJobSchemaScript,
  generateJobOpenGraphMetadata,
  generateJobTwitterMetadata,
  isEligibleForGoogleJobs,
} from '@/lib/seo/google-jobs';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    return {
      title: 'Job Not Found',
    };
  }

  const metadata: Metadata = {
    title: `${job.title} - ${job.schoolName}`,
    description: `${job.description.slice(0, 160)}...`,
    keywords: [
      job.title,
      job.subject,
      `teaching jobs ${job.country}`,
      `${job.city} teacher jobs`,
      job.schoolName,
      'international teaching',
      'ESL jobs',
    ],
    openGraph: generateJobOpenGraphMetadata(job),
    twitter: generateJobTwitterMetadata(job),
  };

  // Add Google for Jobs structured data if eligible
  if (isEligibleForGoogleJobs(job)) {
    metadata.other = {
      'application/ld+json': generateGoogleJobSchemaScript(job),
    };
  }

  return metadata;
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const [job, session, reviews, reviewStats] = await Promise.all([
    getJobById(id),
    auth(),
    getJobReviews(id),
    getJobReviewStats(id),
  ]);

  if (!job) {
    notFound();
  }

  return (
    <JobDetailClient
      job={job}
      session={session}
      reviews={reviews}
      reviewStats={reviewStats}
    />
  );
}
