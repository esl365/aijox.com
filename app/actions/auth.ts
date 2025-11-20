'use server';

import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const callbackUrl = formData.get('callbackUrl') as string | undefined;

    console.log('[Server Action] Attempting sign in for:', email);
    console.log('[Server Action] Callback URL:', callbackUrl || '/school/dashboard');

    // Use redirectTo - NextAuth will handle the redirect and throw NEXT_REDIRECT
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || '/school/dashboard',
    });

    console.log('[Server Action] This line should not be reached if successful');
  } catch (error) {
    console.error('[Server Action] Caught error:', error);

    // NEXT_REDIRECT is thrown on successful sign in - must re-throw it
    if (error instanceof Error) {
      const errorMessage = error.message || '';
      const errorName = error.name || '';
      const errorDigest = (error as any).digest || '';

      console.log('[Server Action] Error details:', {
        name: errorName,
        message: errorMessage,
        digest: errorDigest
      });

      // Check for NEXT_REDIRECT in multiple places
      if (
        errorMessage.includes('NEXT_REDIRECT') ||
        errorName === 'NEXT_REDIRECT' ||
        errorDigest?.includes('NEXT_REDIRECT')
      ) {
        console.log('[Server Action] Detected NEXT_REDIRECT - re-throwing for redirect');
        throw error;
      }
    }

    if (error instanceof AuthError) {
      console.error('[Server Action] AuthError type:', error.type);
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }

    console.error('[Server Action] Unexpected error, returning generic message');
    return 'Something went wrong.';
  }
}
