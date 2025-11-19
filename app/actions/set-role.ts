/**
 * Server Action: Set User Role
 *
 * Updates user role after OAuth sign-in
 */

'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type SetRoleResult = {
  success: boolean;
  message: string;
  redirectUrl?: string;
  error?: string;
};

export async function setUserRole(role: 'TEACHER' | 'RECRUITER' | 'SCHOOL'): Promise<SetRoleResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
        message: 'You must be signed in to set your role',
      };
    }

    // Update user role
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
    });

    revalidatePath('/');

    // Redirect based on role
    const redirectUrl = getSetupUrl(role);

    return {
      success: true,
      message: `Role set to ${role}`,
      redirectUrl,
    };
  } catch (error: any) {
    console.error('Failed to set user role:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to set role. Please try again.',
    };
  }
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
      return '/dashboard';
  }
}
