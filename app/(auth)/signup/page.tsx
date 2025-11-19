import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SignupForm } from '@/components/auth/signup-form';
import { getSetupUrl } from '@/lib/utils/routing';

export const metadata: Metadata = {
  title: 'Sign Up | Global Educator Nexus',
  description: 'Create your account and join thousands of educators worldwide',
};

// Force dynamic rendering to avoid build-time auth issues
export const dynamic = 'force-dynamic';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error('Auth error in signup page:', error);
    // Continue to show signup form if auth fails
  }

  // Redirect if already logged in
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
      <SignupForm callbackUrl={params.callbackUrl} />
    </div>
  );
}
