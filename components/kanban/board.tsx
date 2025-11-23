'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Kanban Board - Phase 2 Task 2.1
 * Drag-and-drop applicant tracking
 */

export type ApplicationStatus =
  | 'new'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected';

export interface KanbanApplication {
  id: string;
  candidateName: string;
  jobTitle: string;
  appliedAt: string;
  status: ApplicationStatus;
}

interface KanbanBoardProps {
  applications: KanbanApplication[];
}

const COLUMN_CONFIG: Record<ApplicationStatus, { title: string; color: string }> = {
  new: { title: 'New', color: 'bg-blue-100 dark:bg-blue-900' },
  screening: { title: 'Screening', color: 'bg-yellow-100 dark:bg-yellow-900' },
  interview: { title: 'Interview', color: 'bg-purple-100 dark:bg-purple-900' },
  offer: { title: 'Offer', color: 'bg-green-100 dark:bg-green-900' },
  hired: { title: 'Hired', color: 'bg-emerald-100 dark:bg-emerald-900' },
  rejected: { title: 'Rejected', color: 'bg-red-100 dark:bg-red-900' },
};

export function KanbanBoard({ applications }: KanbanBoardProps) {
  const columns: ApplicationStatus[] = ['new', 'screening', 'interview', 'offer', 'hired', 'rejected'];

  const getApplicationsByStatus = (status: ApplicationStatus) =>
    applications.filter((app) => app.status === status);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((status) => {
        const config = COLUMN_CONFIG[status];
        const apps = getApplicationsByStatus(status);

        return (
          <div key={status} className="flex-shrink-0 w-80">
            <Card className={config.color}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  {config.title}
                  <Badge variant="secondary">{apps.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {apps.map((app) => (
                  <Card key={app.id} className="bg-background hover:shadow-md transition-shadow cursor-move">
                    <CardContent className="p-3">
                      <p className="font-medium">{app.candidateName}</p>
                      <p className="text-sm text-muted-foreground">{app.jobTitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">{app.appliedAt}</p>
                    </CardContent>
                  </Card>
                ))}
                {apps.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No applications
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
