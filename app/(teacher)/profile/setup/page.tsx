'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TeacherProfileForm } from '@/components/teacher/teacher-profile-form';
import type { TeacherProfileFormData } from '@/lib/validations/teacher-profile';
import { useEffect, useState } from 'react';

// Force dynamic rendering to avoid build-time session issues
export const dynamic = 'force-dynamic';

export default function TeacherSetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    // Redirect if not logged in
    if (!session?.user) {
      router.push('/login');
      return;
    }

    // Redirect if not a teacher
    if (session.user.role !== 'TEACHER') {
      router.push('/dashboard');
      return;
    }

    // Redirect if profile already completed
    if (session.user.hasProfile) {
      router.push('/dashboard');
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  const handleSubmit = async (data: TeacherProfileFormData) => {
    try {
      const response = await fetch('/api/teacher/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
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

        <TeacherProfileForm
          userId={session.user.id}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
