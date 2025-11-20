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

    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || '/school/dashboard',
    });
  } catch (error) {
    // NextAuth throws NEXT_REDIRECT on successful sign in
    // We need to re-throw it to allow the redirect to happen
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
