'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';

/**
 * Team Comments & Mentions - Phase 2 Task 2.3
 */

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  mentions?: string[];
}

interface CommentsProps {
  applicationId: string;
  comments?: Comment[];
}

export function Comments({ applicationId, comments = [] }: CommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    // TODO: Submit comment to API
    await new Promise((resolve) => setTimeout(resolve, 500));
    setNewComment('');
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Team Discussion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <div className="bg-primary text-primary-foreground flex items-center justify-center h-full text-sm">
                  {comment.author[0]}
                </div>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.author}</span>
                  <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Start the discussion!
            </p>
          )}
        </div>

        {/* New Comment Form */}
        <div className="space-y-2 border-t pt-4">
          <Textarea
            placeholder="Add a comment... Use @name to mention team members"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
