import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const metadata: Metadata = {
  title: 'School Setup',
  description: 'Setting up your school profile',
};

export default async function SchoolSetupPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/school/setup');
  }

  if (session.user.role !== 'SCHOOL') {
    redirect('/dashboard');
  }

  // Auto-create school profile if it doesn't exist
  const existingProfile = await prisma.schoolProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!existingProfile) {
    // Create a basic profile for school users
    await prisma.schoolProfile.create({
      data: {
        userId: session.user.id,
        schoolName: session.user.name || 'School',
        country: 'South Korea',
        city: 'Seoul',
        schoolType: 'International School',
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    // Revalidate to update session with new profile status
    revalidatePath('/', 'layout');
  }

  // Redirect to dashboard immediately
  redirect('/school/dashboard');
}
