'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from './StarRating';
import { markReviewHelpful, markReviewNotHelpful } from '@/app/actions/reviews';
import type { ReviewWithAuthor } from '@/app/actions/reviews';

type ReviewCardProps = {
  review: ReviewWithAuthor;
};

export function ReviewCard({ review }: ReviewCardProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [notHelpfulCount, setNotHelpfulCount] = useState(review.notHelpfulCount);
  const [voted, setVoted] = useState(false);

  const handleHelpful = async () => {
    if (voted) return;

    const result = await markReviewHelpful(review.id);
    if (result.success) {
      setHelpfulCount((prev) => prev + 1);
      setVoted(true);
    }
  };

  const handleNotHelpful = async () => {
    if (voted) return;

    const result = await markReviewNotHelpful(review.id);
    if (result.success) {
      setNotHelpfulCount((prev) => prev + 1);
      setVoted(true);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={review.rating} readonly size="sm" />
                {review.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              {review.title && (
                <h3 className="font-semibold text-lg mb-1">{review.title}</h3>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{review.authorName || 'Anonymous Teacher'}</span>
                <span>•</span>
                <span>{format(new Date(review.createdAt), 'MMM dd, yyyy')}</span>
                {review.workPeriod && (
                  <>
                    <span>•</span>
                    <span>Worked: {review.workPeriod}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Comment */}
          <p className="text-sm whitespace-pre-wrap">{review.comment}</p>

          {/* Helpful Buttons */}
          <div className="flex items-center gap-4 pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              Was this review helpful?
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelpful}
                disabled={voted}
                className="text-xs"
              >
                👍 Yes ({helpfulCount})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotHelpful}
                disabled={voted}
                className="text-xs"
              >
                👎 No ({notHelpfulCount})
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
