'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { ApplicationStatus } from '@prisma/client';

type ApplicationTimelineProps = {
  status: ApplicationStatus;
  createdAt: Date;
  viewedAt?: Date | null;
  screenedAt?: Date | null;
  interviewedAt?: Date | null;
  offeredAt?: Date | null;
  hiredAt?: Date | null;
  rejectedAt?: Date | null;
  rejectReason?: string | null;
};

const STATUS_CONFIG = {
  NEW: {
    label: 'Application Submitted',
    color: 'bg-blue-500',
    icon: '📝',
    description: 'Your application has been submitted successfully',
  },
  SCREENING: {
    label: 'Under Review',
    color: 'bg-yellow-500',
    icon: '👀',
    description: 'School is reviewing your application',
  },
  INTERVIEW: {
    label: 'Interview Stage',
    color: 'bg-purple-500',
    icon: '💬',
    description: 'You have been invited for an interview',
  },
  OFFER: {
    label: 'Offer Extended',
    color: 'bg-green-500',
    icon: '🎉',
    description: 'Congratulations! You received a job offer',
  },
  HIRED: {
    label: 'Hired',
    color: 'bg-emerald-600',
    icon: '✅',
    description: 'You have accepted the position',
  },
  REJECTED: {
    label: 'Not Selected',
    color: 'bg-red-500',
    icon: '❌',
    description: 'Unfortunately, you were not selected',
  },
} as const;

const STAGE_ORDER: ApplicationStatus[] = [
  'NEW',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'HIRED',
];

export function ApplicationTimeline({
  status,
  createdAt,
  viewedAt,
  screenedAt,
  interviewedAt,
  offeredAt,
  hiredAt,
  rejectedAt,
  rejectReason,
}: ApplicationTimelineProps) {
  const currentConfig = STATUS_CONFIG[status];

  // Build timeline stages
  const stages = [
    {
      status: 'NEW' as const,
      date: createdAt,
      active: true,
    },
    {
      status: 'SCREENING' as const,
      date: screenedAt || viewedAt,
      active: ['SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'].includes(status),
    },
    {
      status: 'INTERVIEW' as const,
      date: interviewedAt,
      active: ['INTERVIEW', 'OFFER', 'HIRED'].includes(status),
    },
    {
      status: 'OFFER' as const,
      date: offeredAt,
      active: ['OFFER', 'HIRED'].includes(status),
    },
    {
      status: 'HIRED' as const,
      date: hiredAt,
      active: status === 'HIRED',
    },
  ];

  const isRejected = status === 'REJECTED';

  return (
    <Card>
      <CardContent className="p-6">
        {/* Current Status Banner */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{currentConfig.icon}</span>
            <div>
              <h3 className="text-xl font-bold">{currentConfig.label}</h3>
              <p className="text-sm text-muted-foreground">
                {currentConfig.description}
              </p>
            </div>
          </div>
          {isRejected && rejectReason && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-900 dark:text-red-100">
                <strong>Reason:</strong> {rejectReason}
              </p>
            </div>
          )}
        </div>

        {/* Timeline */}
        {!isRejected && (
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

            {/* Stages */}
            <div className="space-y-6">
              {stages.map((stage, index) => {
                const config = STATUS_CONFIG[stage.status];
                const isCompleted = stage.active && stage.date;
                const isCurrent = status === stage.status;
                const isPending =
                  !stage.active && !isCompleted && !isRejected;

                return (
                  <div key={stage.status} className="relative flex gap-4">
                    {/* Icon/Dot */}
                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? `${config.color} border-transparent text-white`
                          : isCurrent
                            ? `border-primary bg-background`
                            : 'border-border bg-background'
                      }`}
                    >
                      {isCompleted ? (
                        <span className="text-sm">{config.icon}</span>
                      ) : isCurrent ? (
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-semibold ${
                            isCompleted || isCurrent
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {config.label}
                        </h4>
                        {isCurrent && (
                          <Badge variant="outline" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      {stage.date && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(stage.date), 'MMM dd, yyyy')} at{' '}
                          {format(new Date(stage.date), 'h:mm a')}
                        </p>
                      )}
                      {isPending && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Pending
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rejected Timeline */}
        {isRejected && (
          <div className="relative">
            <div className="flex gap-4">
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white">
                <span className="text-sm">{STATUS_CONFIG.REJECTED.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">
                  {STATUS_CONFIG.REJECTED.label}
                </h4>
                {rejectedAt && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(rejectedAt), 'MMM dd, yyyy')} at{' '}
                    {format(new Date(rejectedAt), 'h:mm a')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-muted-foreground">
            💡{' '}
            {isRejected
              ? "Don't give up! Keep applying to other positions. You can find more jobs on our job board."
              : status === 'HIRED'
                ? 'Congratulations on your new position! We wish you all the best in your new role.'
                : status === 'OFFER'
                  ? 'Review the offer carefully and respond to the school promptly.'
                  : status === 'INTERVIEW'
                    ? 'Prepare well for your interview. Research the school and practice common interview questions.'
                    : status === 'SCREENING'
                      ? 'Schools typically review applications within 5-10 business days.'
                      : 'Your application has been submitted. You will be notified when the school reviews it.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
