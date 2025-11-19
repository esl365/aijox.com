import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LoginForm } from '@/components/auth/login-form';
import { getSetupUrl } from '@/lib/utils/routing';

export const metadata: Metadata = {
  title: 'Login | Global Educator Nexus',
  description: 'Sign in to your account',
};

// Force dynamic rendering to avoid build-time auth issues
export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error('Auth error in login page:', error);
    // Continue to show login form if auth fails
  }

  if (session?.user) {
    if (!session.user.role) {
      redirect('/select-role');
    }

    if (!session.user.hasProfile) {
      redirect(getSetupUrl(session.user.role, 'select-role'));
    }

    redirect(params.callbackUrl || '/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <LoginForm callbackUrl={params.callbackUrl} />
    </div>
  );
}
