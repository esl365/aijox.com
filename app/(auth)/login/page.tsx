import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login | Global Educator Nexus',
  description: 'Sign in to your account to access teaching opportunities worldwide',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await auth();

  // Redirect if already logged in
  if (session?.user) {
    if (!session.user.role) {
      redirect('/select-role');
    }
    if (!session.user.hasProfile) {
      redirect(getSetupUrl(session.user.role));
    }
    redirect(searchParams.callbackUrl || '/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Global Educator Nexus
          </h1>
          <p className="text-gray-600">
            Connect with teaching opportunities worldwide
          </p>
        </div>

        <LoginForm callbackUrl={searchParams.callbackUrl} />

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <a
            href="/signup"
            className="font-semibold text-primary hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

function getSetupUrl(role: string): string {
  switch (role) {
    case 'TEACHER':
      return '/profile/setup';
    case 'RECRUITER':
      return '/recruiter/setup';
    case 'SCHOOL':
      return '/school/setup';
    default:
      return '/select-role';
  }
}
