'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TeacherProfileForm } from '@/components/teacher/teacher-profile-form';
import type { TeacherProfileFormData } from '@/lib/validations/teacher-profile';
import { useEffect, useState } from 'react';
import { getDashboardUrl } from '@/lib/utils/routing';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorMessage } from '@/components/ui/error-message';
import { useToast } from '@/hooks/use-toast';

export default function TeacherSetupClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    // Redirect if not logged in
    if (!session?.user) {
      router.push('/login');
      return;
    }

    // Redirect if not a teacher
    if (session.user.role !== 'TEACHER') {
      router.push(getDashboardUrl(session.user.role));
      return;
    }

    // Redirect if profile already completed
    if (session.user.hasProfile) {
      router.push(getDashboardUrl('TEACHER'));
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  const handleSubmit = async (data: TeacherProfileFormData) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/teacher/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save profile');
      }

      toast({
        title: 'Profile saved!',
        description: 'Your teacher profile has been created successfully.',
      });

      router.push(getDashboardUrl('TEACHER'));
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile. Please try again.';
      console.error('Error saving profile:', error);
      setError(errorMessage);

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <LoadingScreen message="Setting up your profile..." />;
  }

  if (!session?.user) {
    return null;
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

        {error && (
          <div className="mb-6">
            <ErrorMessage
              message={error}
              onRetry={() => setError(null)}
              retryLabel="Dismiss"
            />
          </div>
        )}

        <TeacherProfileForm
          userId={session.user.id}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
