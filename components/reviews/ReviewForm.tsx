'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createReview, type CreateReviewInput } from '@/app/actions/reviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StarRating } from './StarRating';
import { useToast } from '@/hooks/use-toast';
import type { ReviewType } from '@prisma/client';

type ReviewFormProps = {
  reviewType: ReviewType;
  jobId?: string;
  schoolId?: string;
  jobTitle?: string;
  schoolName?: string;
  onSuccess?: () => void;
};

export function ReviewForm({
  reviewType,
  jobId,
  schoolId,
  jobTitle,
  schoolName,
  onSuccess,
}: ReviewFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [workPeriod, setWorkPeriod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.length < 20) {
      setError('Review must be at least 20 characters');
      return;
    }

    setIsSubmitting(true);

    const input: CreateReviewInput = {
      reviewType,
      rating,
      title: title || undefined,
      comment,
      workPeriod: workPeriod || undefined,
      jobId,
      schoolId,
    };

    const result = await createReview(input);

    if (result.success) {
      toast({
        title: 'Review Submitted',
        description: 'Your review has been submitted and is pending moderation.',
      });

      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setWorkPeriod('');

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } else {
      setError(result.error || 'Failed to submit review');
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }

    setIsSubmitting(false);
  };

  const targetName = jobTitle || schoolName || 'this position';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your experience working at {targetName}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Rating */}
          <div className="space-y-2">
            <Label>
              Overall Rating <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <StarRating rating={rating} onRatingChange={setRating} size="lg" />
              {rating > 0 && (
                <span className="text-sm text-muted-foreground">
                  {rating === 5
                    ? 'Excellent'
                    : rating === 4
                      ? 'Good'
                      : rating === 3
                        ? 'Average'
                        : rating === 2
                          ? 'Poor'
                          : 'Very Poor'}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Sum up your experience in one line"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/100 characters
            </p>
          </div>

          {/* Work Period */}
          <div className="space-y-2">
            <Label htmlFor="workPeriod">Work Period (Optional)</Label>
            <Input
              id="workPeriod"
              placeholder="e.g., 2022-2023 or 6 months"
              value={workPeriod}
              onChange={(e) => setWorkPeriod(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              When did you work here?
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Your Review <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your experience working at this school. What did you like? What could be improved?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              maxLength={5000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/5000 characters (minimum 20)
            </p>
          </div>

          {/* Guidelines */}
          <div className="bg-muted/50 p-4 rounded-md">
            <p className="text-sm font-medium mb-2">Review Guidelines:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Be honest and constructive</li>
              <li>Focus on your personal experience</li>
              <li>Avoid profanity and personal attacks</li>
              <li>Reviews are moderated before being published</li>
              <li>Do not include personal contact information</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRating(0);
                setTitle('');
                setComment('');
                setWorkPeriod('');
                setError(null);
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
