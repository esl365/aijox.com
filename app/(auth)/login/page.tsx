import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LoginForm } from '@/components/auth/login-form';
import { getSetupUrl } from '@/lib/utils/routing';

export const metadata: Metadata = {
  title: 'Login | Global Educator Nexus',
  description: 'Sign in to your account',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await auth();

  if (session?.user) {
    if (!session.user.role) {
      redirect('/select-role');
    }

    if (!session.user.hasProfile) {
      redirect(getSetupUrl(session.user.role, 'select-role'));
    }

    redirect(searchParams.callbackUrl || '/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <LoginForm callbackUrl={searchParams.callbackUrl} />
    </div>
  );
}
