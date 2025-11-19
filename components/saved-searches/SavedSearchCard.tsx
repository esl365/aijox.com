import { useState } from 'react';
import Link from 'next/link';
import type { SavedSearch } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  deleteSavedSearch,
  toggleSavedSearchActive,
} from '@/app/actions/saved-searches';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  generateSearchSummary,
  getAlertFrequencyLabel,
  type SavedSearchFilters,
  type AlertFrequency,
} from '@/lib/types/saved-search';

type SavedSearchCardProps = {
  savedSearch: SavedSearch;
  onUpdate?: () => void;
};

export function SavedSearchCard({ savedSearch, onUpdate }: SavedSearchCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const filters = savedSearch.filters as SavedSearchFilters;
  const alertFrequency = savedSearch.alertFrequency as AlertFrequency;

  const handleToggleActive = async () => {
    setLoading(true);
    const result = await toggleSavedSearchActive(savedSearch.id);

    if (result.success) {
      toast({
        title: 'Updated',
        description: result.message,
      });
      onUpdate?.();
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this saved search?')) {
      return;
    }

    setLoading(true);
    const result = await deleteSavedSearch(savedSearch.id);

    if (result.success) {
      toast({
        title: 'Deleted',
        description: result.message,
      });
      onUpdate?.();
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Card className={!savedSearch.isActive ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              {savedSearch.name || 'Unnamed Search'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {generateSearchSummary(filters)}
            </p>
          </div>
          <Badge variant={savedSearch.isActive ? 'default' : 'secondary'}>
            {savedSearch.isActive ? 'Active' : 'Paused'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Filter Details */}
        <div className="flex flex-wrap gap-2">
          {filters.country && (
            <Badge variant="outline">📍 {filters.country}</Badge>
          )}
          {filters.subject && (
            <Badge variant="outline">📚 {filters.subject}</Badge>
          )}
          {filters.minSalary && (
            <Badge variant="outline">💰 ${filters.minSalary}+</Badge>
          )}
          {filters.housingProvided && (
            <Badge variant="outline">🏠 Housing</Badge>
          )}
          {filters.flightProvided && (
            <Badge variant="outline">✈️ Flight</Badge>
          )}
        </div>

        {/* Alert Settings */}
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Alert frequency:</span>
            <span className="font-medium">
              {getAlertFrequencyLabel(alertFrequency)}
            </span>
          </div>
          {savedSearch.lastAlertSent && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Last alert:</span>
              <span>{formatDate(savedSearch.lastAlertSent)}</span>
              <span className="text-muted-foreground">
                ({savedSearch.lastMatchCount} jobs)
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <div className="flex gap-2">
          <Link
            href={`/saved-searches/${savedSearch.id}/results`}
          >
            <Button variant="outline" size="sm">
              View Jobs
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleActive}
            disabled={loading}
          >
            {savedSearch.isActive ? 'Pause' : 'Resume'}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
