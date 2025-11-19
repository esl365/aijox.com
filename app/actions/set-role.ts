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
import { getSetupUrl } from '@/lib/utils/routing';

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

    // Redirect based on role (uses centralized routing utility)
    const redirectUrl = getSetupUrl(role, 'dashboard');

    return {
      success: true,
      message: `Role set to ${role}`,
      redirectUrl,
    };
  } catch (error) {
    console.error('Failed to set user role:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      message: 'Failed to set role. Please try again.',
    };
  }
}
