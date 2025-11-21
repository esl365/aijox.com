'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Star, Trash2, Edit, Plus } from 'lucide-react';
import {
  createSavedFilter,
  deleteSavedFilter,
  setDefaultFilter
} from '@/app/actions/saved-filters';
import { useRouter } from 'next/navigation';
import type { FilterConfig } from '@/app/actions/saved-filters';

interface SavedFilter {
  id: string;
  name: string;
  filterConfig: FilterConfig;
  isDefault: boolean;
  createdAt: Date;
}

interface SavedFiltersPanelProps {
  filters: SavedFilter[];
  onApplyFilter: (filter: SavedFilter) => void;
}

export function SavedFiltersPanel({ filters: initialFilters, onApplyFilter }: SavedFiltersPanelProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = async (filterId: string) => {
    if (!confirm('Are you sure you want to delete this filter?')) return;

    startTransition(async () => {
      try {
        const result = await deleteSavedFilter(filterId);
        if (result.success) {
          setFilters(filters.filter(f => f.id !== filterId));
          router.refresh();
        }
      } catch (error) {
        console.error('Failed to delete filter:', error);
      }
    });
  };

  const handleSetDefault = async (filterId: string) => {
    startTransition(async () => {
      try {
        const result = await setDefaultFilter(filterId);
        if (result.success) {
          setFilters(filters.map(f => ({
            ...f,
            isDefault: f.id === filterId
          })));
          router.refresh();
        }
      } catch (error) {
        console.error('Failed to set default filter:', error);
      }
    });
  };

  const getFilterSummary = (config: FilterConfig): string => {
    const parts: string[] = [];

    if (config.status && config.status.length > 0) {
      parts.push(`Status: ${config.status.join(', ')}`);
    }
    if (config.rating) {
      parts.push(`Rating: ${config.rating.min || 1}-${config.rating.max || 5}`);
    }
    if (config.tags && config.tags.length > 0) {
      parts.push(`Tags: ${config.tags.slice(0, 2).join(', ')}${config.tags.length > 2 ? '...' : ''}`);
    }
    if (config.aiMatchScore) {
      parts.push(`AI Score: ${config.aiMatchScore.min || 0}-${config.aiMatchScore.max || 100}%`);
    }

    return parts.length > 0 ? parts.join(' • ') : 'Custom filter';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-xl">Saved Filters</CardTitle>
            <Badge variant="secondary" className="ml-2">
              {filters.length}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Create Form */}
          {showCreateForm && (
            <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-950">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Filter name..."
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                  disabled={isPending}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (!newFilterName.trim()) return;

                      startTransition(async () => {
                        try {
                          // TODO: Get current filter config from parent
                          const result = await createSavedFilter(
                            newFilterName,
                            {}, // Empty config for now
                            false
                          );
                          if (result.success && result.filter) {
                            setFilters([...filters, result.filter as SavedFilter]);
                            setNewFilterName('');
                            setShowCreateForm(false);
                            router.refresh();
                          }
                        } catch (error) {
                          console.error('Failed to create filter:', error);
                        }
                      });
                    }}
                    disabled={isPending || !newFilterName.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewFilterName('');
                    }}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Filters List */}
          {filters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Filter className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No saved filters yet</p>
              <p className="text-xs">Create a filter to quickly access common searches</p>
            </div>
          ) : (
            filters.map((filter) => (
              <div
                key={filter.id}
                className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{filter.name}</h4>
                      {filter.isDefault && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {getFilterSummary(filter.filterConfig)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!filter.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSetDefault(filter.id)}
                        disabled={isPending}
                        title="Set as default"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                      onClick={() => handleDelete(filter.id)}
                      disabled={isPending}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => onApplyFilter(filter)}
                  disabled={isPending}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Apply Filter
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
