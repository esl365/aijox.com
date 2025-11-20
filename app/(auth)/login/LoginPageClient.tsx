'use client';

import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { useEffect } from 'react';

export default function LoginPageClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || undefined;
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      console.log('NextAuth error:', error);
      console.log('All search params:', Object.fromEntries(searchParams.entries()));
    }
  }, [error, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
