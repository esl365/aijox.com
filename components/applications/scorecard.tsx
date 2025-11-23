'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

/**
 * Evaluation Scorecards - Phase 2 Task 2.4
 */

export interface ScorecardCriteria {
  name: string;
  description: string;
  score: number; // 1-5
}

interface ScorecardProps {
  applicationId: string;
  onSubmit?: (scores: ScorecardCriteria[]) => void;
}

const DEFAULT_CRITERIA: ScorecardCriteria[] = [
  { name: 'Teaching Experience', description: 'Relevant teaching background', score: 0 },
  { name: 'Communication Skills', description: 'Clarity and professionalism', score: 0 },
  { name: 'Cultural Fit', description: 'Alignment with school values', score: 0 },
  { name: 'Subject Knowledge', description: 'Expertise in subject area', score: 0 },
  { name: 'Classroom Management', description: 'Ability to manage students', score: 0 },
];

export function Scorecard({ applicationId, onSubmit }: ScorecardProps) {
  const [criteria, setCriteria] = useState<ScorecardCriteria[]>(DEFAULT_CRITERIA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateScore = (index: number, score: number) => {
    const newCriteria = [...criteria];
    newCriteria[index].score = score;
    setCriteria(newCriteria);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSubmit?.(criteria);
    setIsSubmitting(false);
  };

  const averageScore =
    criteria.reduce((sum, c) => sum + c.score, 0) / criteria.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Evaluation Scorecard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {criteria.map((criterion, index) => (
          <div key={index} className="space-y-2">
            <Label className="text-sm font-medium">{criterion.name}</Label>
            <p className="text-xs text-muted-foreground">{criterion.description}</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateScore(index, rating)}
                  className={`
                    w-10 h-10 rounded-md border-2 transition-colors
                    ${
                      criterion.score === rating
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-gray-300 hover:border-primary'
                    }
                  `}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Average Score:</span>
            <span className="text-2xl font-bold">{averageScore.toFixed(1)} / 5.0</span>
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : 'Save Evaluation'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
