import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { RoleSelector } from '@/components/auth/role-selector';
import { getSetupUrl } from '@/lib/utils/routing';

export const metadata: Metadata = {
  title: 'Select Your Role | Global Educator Nexus',
  description: 'Choose your role to get started',
};

// Force dynamic rendering to avoid build-time auth issues
export const dynamic = 'force-dynamic';

export default async function SelectRolePage() {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error('Auth error in select-role page:', error);
    // Redirect to login if auth fails
    redirect('/login');
  }

  // Redirect if not logged in
  if (!session?.user) {
    redirect('/login');
  }

  // Redirect if role already set
  if (session.user.role) {
    if (session.user.hasProfile) {
      redirect('/dashboard');
    } else {
      redirect(getSetupUrl(session.user.role, 'dashboard'));
    }
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
