'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LoginForm } from '@/components/auth/login-form';
import { getSetupUrl, getDashboardUrl } from '@/lib/utils/routing';

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = searchParams.get('callbackUrl') || undefined;

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      if (!session.user.role) {
        router.push('/select-role');
        return;
      }

      if (!session.user.hasProfile) {
        router.push(getSetupUrl(session.user.role, 'select-role'));
        return;
      }

      router.push(callbackUrl || getDashboardUrl(session.user.role));
    }
  }, [session, status, router, callbackUrl]);

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

  // Don't show form if redirecting
  if (session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
