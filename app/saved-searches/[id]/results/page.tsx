import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import {
  getSavedSearchById,
  getJobsForSavedSearch,
} from '@/app/actions/saved-searches';
import { SavedSearchResultsClient } from './SavedSearchResultsClient';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const savedSearch = await getSavedSearchById(id);

  if (!savedSearch) {
    return {
      title: 'Search Not Found',
    };
  }

  return {
    title: `Results for ${savedSearch.name || 'Saved Search'}`,
    description: 'View jobs matching your saved search criteria',
  };
}

export default async function SavedSearchResultsPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== 'TEACHER') {
    redirect('/login?callbackUrl=/saved-searches');
  }

  const [savedSearch, jobsResult] = await Promise.all([
    getSavedSearchById(id),
    getJobsForSavedSearch(id),
  ]);

  if (!savedSearch) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <SavedSearchResultsClient
          savedSearch={savedSearch}
          jobs={jobsResult.jobs}
          total={jobsResult.total || 0}
        />
      </div>
    </div>
  );
}
