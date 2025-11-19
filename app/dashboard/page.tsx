import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTeacherDashboard, getRecommendedJobs } from '@/app/actions/dashboard';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your teaching job dashboard - track applications, visa status, and profile completeness',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/');
  }

  const [dashboardData, recommendedJobs] = await Promise.all([
    getTeacherDashboard(),
    getRecommendedJobs(session.user.teacherProfileId!)
  ]);

  if (!dashboardData) {
    redirect('/profile/setup');
  }

  return (
    <DashboardClient
      data={dashboardData}
      recommendedJobs={recommendedJobs}
      userName={session.user.name || 'Teacher'}
    />
  );
}
