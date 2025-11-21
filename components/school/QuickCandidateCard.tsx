'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Eye, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateApplicationStatus } from '@/app/actions/applications';

export interface QuickCandidate {
  id: string;
  candidateName: string;
  jobTitle: string;
  appliedDate: Date;
  aiMatchScore?: number | null;
}

interface QuickCandidateCardProps {
  candidate: QuickCandidate;
  onStatusChange?: () => void;
}

export function QuickCandidateCard({ candidate, onStatusChange }: QuickCandidateCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    startTransition(async () => {
      try {
        await updateApplicationStatus(candidate.id, 'SCREENING');
        setIsApproved(true);
        router.refresh();
        onStatusChange?.();
      } catch (error) {
        console.error('Failed to approve application:', error);
      }
    });
  };

  const handleReject = async () => {
    startTransition(async () => {
      try {
        await updateApplicationStatus(candidate.id, 'REJECTED');
        setIsRejected(true);
        router.refresh();
        onStatusChange?.();
      } catch (error) {
        console.error('Failed to reject application:', error);
      }
    });
  };

  const getScoreColor = (score?: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score?: number | null): 'default' | 'secondary' | 'destructive' => {
    if (!score) return 'secondary';
    if (score >= 75) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (isApproved || isRejected) {
    return (
      <Card className={`${isApproved ? 'bg-green-50' : 'bg-red-50'} dark:${isApproved ? 'bg-green-950' : 'bg-red-950'}`}>
        <CardContent className="p-4">
          <div className="text-center py-2">
            {isApproved ? (
              <>
                <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-green-600">Moved to Screening</p>
              </>
            ) : (
              <>
                <X className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-red-600">Application Rejected</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full shrink-0">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{candidate.candidateName}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {candidate.jobTitle}
              </p>
            </div>
          </div>
          {candidate.aiMatchScore !== undefined && candidate.aiMatchScore !== null && (
            <Badge variant={getScoreBadgeVariant(candidate.aiMatchScore)} className="text-xs shrink-0">
              {candidate.aiMatchScore}%
            </Badge>
          )}
        </div>

        <div className="text-xs text-gray-500 mb-3">
          Applied {new Date(candidate.appliedDate).toLocaleDateString()}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Link href={`/school/applications/${candidate.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full text-xs"
              disabled={isPending}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </Link>
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs bg-green-600 hover:bg-green-700"
            onClick={handleApprove}
            disabled={isPending}
          >
            <Check className="h-3 w-3 mr-1" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={handleReject}
            disabled={isPending}
          >
            <X className="h-3 w-3 mr-1" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
