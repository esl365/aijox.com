import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getMyApplications } from '@/app/actions/applications';
import { ApplicationsClient } from './ApplicationsClient';

export const metadata: Metadata = {
  title: 'My Applications',
  description: 'Track your job applications and their status',
};

export default async function ApplicationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/applications');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/');
  }

  const applications = await getMyApplications();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <ApplicationsClient applications={applications} />
      </div>
    </div>
  );
}
