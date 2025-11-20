'use client';

import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPageClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
