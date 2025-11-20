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

    // Don't use redirectTo - let client handle redirect after session is established
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    // Return success - client will handle redirect
    return { success: true };
  } catch (error) {
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
