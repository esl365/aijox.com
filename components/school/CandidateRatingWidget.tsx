'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Tag, User, X } from 'lucide-react';
import { updateCandidateRating } from '@/app/actions/collaboration';
import { useRouter } from 'next/navigation';

interface CandidateRatingWidgetProps {
  applicationId: string;
  initialRating?: {
    rating: number;
    tags: string[];
    assignedTo?: {
      name: string | null;
      email: string;
    } | null;
  } | null;
  teamMembers?: {
    id: string;
    name: string | null;
    email: string;
  }[];
}

const COMMON_TAGS = [
  'Top Pick',
  'Culture Fit',
  'Strong Experience',
  'Great Communication',
  'Needs Follow-up',
  'Maybe Later',
  'Fast Track'
];

export function CandidateRatingWidget({
  applicationId,
  initialRating,
  teamMembers = []
}: CandidateRatingWidgetProps) {
  const [rating, setRating] = useState(initialRating?.rating || 3);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialRating?.tags || []);
  const [customTag, setCustomTag] = useState('');
  const [assignedToId, setAssignedToId] = useState<string | undefined>(
    initialRating?.assignedTo ? String(initialRating.assignedTo) : undefined
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = async () => {
    startTransition(async () => {
      try {
        const result = await updateCandidateRating(
          applicationId,
          rating,
          selectedTags,
          assignedToId
        );
        if (result.success) {
          router.refresh();
        }
      } catch (error) {
        console.error('Failed to update rating:', error);
      }
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-xl">Rating & Tags</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Rating Stars */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  disabled={isPending}
                  className="focus:outline-none hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating}/5
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Tags</label>
            <div className="space-y-2">
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Common Tags */}
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom tag..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  className="flex-1 px-3 py-1 text-sm border rounded-md"
                  disabled={isPending}
                />
                <Button
                  size="sm"
                  onClick={addCustomTag}
                  disabled={isPending || !customTag.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Assign To */}
          {teamMembers.length > 0 && (
            <div>
              <label className="text-sm font-semibold mb-2 block">Assign To</label>
              <select
                value={assignedToId || ''}
                onChange={(e) => setAssignedToId(e.target.value || undefined)}
                className="w-full px-3 py-2 text-sm border rounded-md"
                disabled={isPending}
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name || member.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? 'Saving...' : 'Save Rating'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
