'use server';

import { signIn } from '@/lib/auth';
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

    // Check for errors
    if (result?.error) {
      console.error('[Server Action] Sign in failed:', result.error);
      return 'Invalid credentials.';
    }

    // Sign in successful - session cookie is set
    // Perform server-side redirect (cookie will be included in response)
    console.log('[Server Action] Sign in successful, redirecting to:', callbackUrl || '/school/dashboard');
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
