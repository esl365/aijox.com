import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { TeacherProfileForm } from '@/components/teacher/teacher-profile-form';

export const metadata: Metadata = {
  title: 'Complete Your Profile | Global Educator Nexus',
  description: 'Set up your teacher profile to start finding opportunities',
};

export default async function TeacherSetupPage() {
  const session = await auth();

  // Redirect if not logged in
  if (!session?.user) {
    redirect('/login');
  }

  // Redirect if not a teacher
  if (session.user.role !== 'TEACHER') {
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
            Complete Your Teacher Profile
          </h1>
          <p className="text-gray-600">
            Fill in your information to start connecting with schools worldwide.
            This information will be used by our AI to match you with relevant opportunities.
          </p>
        </div>

        <TeacherProfileForm userId={session.user.id} />
      </div>
    </div>
  );
}
