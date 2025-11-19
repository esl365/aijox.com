'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getSetupUrl } from '@/lib/utils/routing';

export async function setUserRole(role: 'TEACHER' | 'RECRUITER' | 'SCHOOL') {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Not authenticated'
    };
  }

  if (session.user.role) {
    return {
      success: false,
      error: 'Role already set'
    };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role }
    });

    revalidatePath('/');

    return {
      success: true,
      setupUrl: getSetupUrl(role, 'dashboard')
    };
  } catch (error) {
    console.error('Set role error:', error);
    return {
      success: false,
      error: 'Failed to set role'
    };
  }
}
