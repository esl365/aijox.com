'use client';

import Link from 'next/link';
import type { SavedSearch } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SavedSearchCard } from '@/components/saved-searches/SavedSearchCard';

type SavedSearchesClientProps = {
  savedSearches: SavedSearch[];
  userName: string;
};

export function SavedSearchesClient({
  savedSearches,
  userName,
}: SavedSearchesClientProps) {
  const activeSearches = savedSearches.filter((s) => s.isActive);
  const pausedSearches = savedSearches.filter((s) => !s.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Saved Searches</h1>
          <p className="text-muted-foreground">
            Manage your job alerts and saved searches
          </p>
        </div>
        <Link href="/jobs">
          <Button>Browse Jobs</Button>
        </Link>
      </div>

      {/* Stats */}
      {savedSearches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{savedSearches.length}</div>
              <p className="text-sm text-muted-foreground">Total Searches</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{activeSearches.length}</div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {savedSearches.reduce(
                  (sum, s) => sum + s.lastMatchCount,
                  0
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Recent Matches
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {savedSearches.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold">No saved searches yet</h3>
            <p className="mt-2 text-muted-foreground">
              Save your job searches to get notified when new matching positions are posted
            </p>
            <Link href="/jobs">
              <Button className="mt-4">Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Active Searches */}
      {activeSearches.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Active Alerts ({activeSearches.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeSearches.map((search) => (
              <SavedSearchCard key={search.id} savedSearch={search} />
            ))}
          </div>
        </div>
      )}

      {/* Paused Searches */}
      {pausedSearches.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Paused ({pausedSearches.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pausedSearches.map((search) => (
              <SavedSearchCard key={search.id} savedSearch={search} />
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      {savedSearches.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">💡 Tips</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Click "View Jobs" to see current matches for a search</li>
              <li>• Pause alerts when you're not actively job hunting</li>
              <li>• Set frequency to "Weekly" to reduce email clutter</li>
              <li>• Delete old searches to keep your list organized</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
