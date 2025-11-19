'use client';

import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCompletionBannerProps {
  completionScore: number; // 0-100
  role: 'TEACHER' | 'SCHOOL' | 'RECRUITER';
  missingFields?: string[];
  className?: string;
}

export function ProfileCompletionBanner({
  completionScore,
  role,
  missingFields = [],
  className,
}: ProfileCompletionBannerProps) {
  // Don't show if profile is complete
  if (completionScore >= 100) {
    return null;
  }

  // Determine urgency based on completion score
  const getUrgencyLevel = () => {
    if (completionScore < 40) return { level: 'critical', color: 'destructive' as const };
    if (completionScore < 70) return { level: 'warning', color: 'warning' as const };
    return { level: 'info', color: 'default' as const };
  };

  const urgency = getUrgencyLevel();

  // Get role-specific messages
  const getRoleMessage = () => {
    switch (role) {
      case 'TEACHER':
        return {
          title: 'Complete Your Teacher Profile',
          description:
            'Teachers with complete profiles receive 3x more job opportunities and higher visibility in searches.',
          ctaText: 'Complete Profile',
          ctaUrl: '/profile/setup',
        };
      case 'SCHOOL':
        return {
          title: 'Complete Your School Profile',
          description:
            'Complete profiles attract more qualified candidates and build trust with teachers.',
          ctaText: 'Complete Profile',
          ctaUrl: '/setup',
        };
      case 'RECRUITER':
        return {
          title: 'Complete Your Recruiter Profile',
          description:
            'Complete your profile to unlock advanced features and connect with more candidates.',
          ctaText: 'Complete Profile',
          ctaUrl: '/setup',
        };
    }
  };

  const message = getRoleMessage();

  return (
    <Alert variant={urgency.color} className={cn('mb-6', className)}>
      <div className="flex items-start gap-4">
        {completionScore < 70 ? (
          <AlertCircle className="h-5 w-5 mt-0.5" />
        ) : (
          <CheckCircle2 className="h-5 w-5 mt-0.5" />
        )}
        <div className="flex-1 space-y-3">
          <div>
            <AlertTitle className="text-base">{message.title}</AlertTitle>
            <AlertDescription className="mt-1">{message.description}</AlertDescription>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Profile Completion: {completionScore}%</span>
              {completionScore >= 80 && (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Almost there!
                </span>
              )}
            </div>
            <Progress value={completionScore} className="h-2" />
          </div>

          {/* Missing Fields */}
          {missingFields.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Complete these sections to improve your profile:</p>
              <ul className="text-sm space-y-1">
                {missingFields.slice(0, 5).map((field, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{field}</span>
                  </li>
                ))}
                {missingFields.length > 5 && (
                  <li className="text-muted-foreground text-xs">
                    +{missingFields.length - 5} more...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* CTA Button */}
          <Button asChild size="sm">
            <Link href={message.ctaUrl}>{message.ctaText}</Link>
          </Button>
        </div>
      </div>
    </Alert>
  );
}
