import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getJobById } from '@/app/actions/jobs';
import { validateJobApplication } from '@/app/actions/visa-validation';
import { ApplicationForm } from './ApplicationForm';

type Props = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Apply for Job',
  description: 'Submit your application for this teaching position',
};

export default async function ApplyPage({ params }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/jobs/${params.id}/apply`);
  }

  if (session.user.role !== 'TEACHER' || !session.user.teacherProfileId) {
    redirect('/');
  }

  const job = await getJobById(params.id);

  if (!job) {
    notFound();
  }

  // Validate eligibility
  const validation = await validateJobApplication(
    session.user.teacherProfileId,
    params.id
  );

  if (!validation.canApply) {
    redirect(`/jobs/${params.id}?error=${encodeURIComponent(validation.reason || 'Not eligible')}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <ApplicationForm
          job={job}
          validation={validation}
          teacherId={session.user.teacherProfileId}
        />
      </div>
    </div>
  );
}
