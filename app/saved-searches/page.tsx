import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getMySavedSearches } from '@/app/actions/saved-searches';
import { SavedSearchesClient } from './SavedSearchesClient';

export const metadata: Metadata = {
  title: 'Saved Searches',
  description: 'Manage your saved job searches and email alerts',
};

export default async function SavedSearchesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/saved-searches');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/');
  }

  const savedSearches = await getMySavedSearches();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <SavedSearchesClient
          savedSearches={savedSearches}
          userName={session.user.name || 'Teacher'}
        />
      </div>
    </div>
  );
}
