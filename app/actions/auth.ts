'use server';

import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';

type AuthState =
  | { success: true; error?: never }
  | { error: string; success?: never }
  | undefined;

export async function authenticate(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('[Server Action] Attempting sign in for:', email);

    // Don't use redirectTo - let client handle redirect after session is established
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    console.log('[Server Action] Sign in result:', result);

    // Return success - client will handle redirect
    const successState = { success: true as const };
    console.log('[Server Action] Returning success state:', successState);
    return successState;
  } catch (error) {
    console.error('[Server Action] Error during sign in:', error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials.' };
        default:
          return { error: 'Something went wrong.' };
      }
    }
    return { error: 'Something went wrong.' };
  }
}
