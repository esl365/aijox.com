import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import JobCreationForm from '@/components/recruiter/job-creation-form';

export const metadata: Metadata = {
  title: 'Create Job Posting - AI Assisted',
  description: 'Create a new teaching position with AI-powered job extraction',
};

export default async function CreateJobPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/recruiter/jobs/create');
  }

  if (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN' && session.user.role !== 'SCHOOL') {
    redirect('/dashboard');
  }

  return <JobCreationForm />;
}
