'use server';

import { signIn, auth } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const callbackUrl = formData.get('callbackUrl') as string | undefined;

    console.log('[Server Action] Attempting sign in for:', email);

    // Use redirect: false to handle errors properly
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    console.log('[Server Action] Sign in result:', result);

    // If sign in was successful, check session and redirect
    if (result?.error) {
      console.error('[Server Action] Sign in failed:', result.error);
      return 'Invalid credentials.';
    }

    // Verify session was created
    const session = await auth();
    console.log('[Server Action] Session after sign in:', session?.user?.email);

    if (!session?.user) {
      return 'Failed to create session.';
    }

    // Session is valid, perform server-side redirect
    console.log('[Server Action] Redirecting to:', callbackUrl || '/school/dashboard');
    redirect(callbackUrl || '/school/dashboard');
  } catch (error) {
    console.error('[Server Action] Error during sign in:', error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    // Re-throw redirect errors
    throw error;
  }
}
