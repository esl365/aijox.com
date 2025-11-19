'use client';

import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Briefcase, UserCheck, FileText } from 'lucide-react';

type ActivityType = 'application' | 'hire' | 'job_posted';

interface Activity {
  type: ActivityType;
  date: Date;
  jobTitle: string;
  teacherName?: string;
  status?: string;
}

interface RecentActivityProps {
  activities: Activity[];
  limit?: number;
}

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: typeof FileText; color: string; label: (activity: Activity) => string }
> = {
  application: {
    icon: FileText,
    color: 'bg-blue-100 text-blue-700',
    label: (activity) =>
      `${activity.teacherName} applied${activity.status ? ` (${activity.status})` : ''}`,
  },
  hire: {
    icon: UserCheck,
    color: 'bg-green-100 text-green-700',
    label: (activity) => `${activity.teacherName} was hired`,
  },
  job_posted: {
    icon: Briefcase,
    color: 'bg-purple-100 text-purple-700',
    label: () => 'Job posted',
  },
};

export function RecentActivity({ activities, limit = 10 }: RecentActivityProps) {
  const displayActivities = activities.slice(0, limit);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {displayActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity
          </p>
        ) : (
          displayActivities.map((activity, index) => {
            const config = ACTIVITY_CONFIG[activity.type];
            const Icon = config.icon;

            return (
              <div key={index} className="flex items-start gap-4">
                <div className={`rounded-full p-2 ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.jobTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {config.label(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
