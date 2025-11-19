import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { RecruiterSetupForm } from '@/components/recruiter/recruiter-setup-form';

export const metadata: Metadata = {
  title: 'Complete Your Profile | Global Educator Nexus',
  description: 'Set up your recruiter profile to start posting jobs',
};

export default async function RecruiterSetupPage() {
  const session = await auth();

  // Redirect if not logged in
  if (!session?.user) {
    redirect('/login');
  }

  // Redirect if not a recruiter
  if (session.user.role !== 'RECRUITER') {
    redirect('/dashboard');
  }

  // Redirect if profile already completed
  if (session.user.hasProfile) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Recruiter Profile
          </h1>
          <p className="text-gray-600">
            Set up your organization information to start posting jobs and finding qualified teachers.
          </p>
        </div>

        <RecruiterSetupForm userId={session.user.id} />
      </div>
    </div>
  );
}
