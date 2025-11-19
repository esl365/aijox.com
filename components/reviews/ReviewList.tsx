'use client';

import { useState } from 'react';
import { ReviewCard } from './ReviewCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReviewWithAuthor } from '@/app/actions/reviews';

type ReviewListProps = {
  reviews: ReviewWithAuthor[];
  showFilters?: boolean;
};

type SortOption = 'recent' | 'highest' | 'lowest' | 'helpful';

export function ReviewList({ reviews, showFilters = true }: ReviewListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(5);

  // Sort reviews
  let sortedReviews = [...reviews];
  switch (sortBy) {
    case 'recent':
      sortedReviews.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case 'highest':
      sortedReviews.sort((a, b) => b.rating - a.rating);
      break;
    case 'lowest':
      sortedReviews.sort((a, b) => a.rating - b.rating);
      break;
    case 'helpful':
      sortedReviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
      break;
  }

  // Filter by rating
  if (filterRating !== 'all') {
    sortedReviews = sortedReviews.filter((r) => r.rating === filterRating);
  }

  // Limit visible reviews
  const visibleReviews = sortedReviews.slice(0, visibleCount);
  const hasMore = sortedReviews.length > visibleCount;

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <div className="text-4xl mb-4">💭</div>
        <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
        <p className="text-muted-foreground">
          Be the first to share your experience!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="highest">Highest Rating</SelectItem>
                <SelectItem value="lowest">Lowest Rating</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">Filter:</span>
            <Select
              value={filterRating.toString()}
              onValueChange={(v) => setFilterRating(v === 'all' ? 'all' : Number(v))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Reviews */}
      {sortedReviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No reviews match your filters
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((prev) => prev + 5)}
              >
                Load More Reviews ({sortedReviews.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
