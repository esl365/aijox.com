'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { RoleSelector } from '@/components/auth/role-selector';
import { getSetupUrl, getDashboardUrl } from '@/lib/utils/routing';

export default function SelectRolePageClient() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    // Redirect if not logged in
    if (!session?.user) {
      router.push('/login');
      return;
    }

    // Redirect if role already set
    if (session.user.role) {
      if (session.user.hasProfile) {
        router.push(getDashboardUrl(session.user.role));
      } else {
        router.push(getSetupUrl(session.user.role, 'select-role'));
      }
    }
  }, [session, status, router]);

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show form if not authenticated or redirecting
  if (!session?.user || session.user.role) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Global Educator Nexus
          </h1>
          <p className="text-lg text-gray-600">
            Choose your role to personalize your experience
          </p>
        </div>

        <RoleSelector />

        <p className="text-center text-sm text-gray-600 mt-8">
          You can always change your role later in settings
        </p>
      </div>
    </div>
  );
}
