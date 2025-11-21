'use client';

import { Activity as PrismaActivity, ActivityType } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  UserCheck,
  UserX,
  UserPlus,
  Calendar,
  CheckCircle,
  Briefcase,
  Edit,
  XCircle,
  Award
} from 'lucide-react';
import Link from 'next/link';

interface ActivityFeedProps {
  activities: PrismaActivity[];
  limit?: number;
}

export function ActivityFeed({ activities, limit = 10 }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, limit);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'APPLICATION_RECEIVED':
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'APPLICATION_APPROVED':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'APPLICATION_REJECTED':
        return <UserX className="h-4 w-4 text-red-600" />;
      case 'APPLICATION_SHORTLISTED':
        return <Award className="h-4 w-4 text-purple-600" />;
      case 'INTERVIEW_SCHEDULED':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      case 'INTERVIEW_COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'JOB_POSTED':
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case 'JOB_UPDATED':
        return <Edit className="h-4 w-4 text-yellow-600" />;
      case 'JOB_EXPIRED':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'CANDIDATE_HIRED':
        return <Award className="h-4 w-4 text-green-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'APPLICATION_RECEIVED':
        return 'bg-blue-100 dark:bg-blue-900';
      case 'APPLICATION_APPROVED':
      case 'INTERVIEW_COMPLETED':
      case 'CANDIDATE_HIRED':
        return 'bg-green-100 dark:bg-green-900';
      case 'APPLICATION_REJECTED':
        return 'bg-red-100 dark:bg-red-900';
      case 'APPLICATION_SHORTLISTED':
        return 'bg-purple-100 dark:bg-purple-900';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-orange-100 dark:bg-orange-900';
      case 'JOB_POSTED':
        return 'bg-blue-100 dark:bg-blue-900';
      case 'JOB_UPDATED':
        return 'bg-yellow-100 dark:bg-yellow-900';
      case 'JOB_EXPIRED':
        return 'bg-gray-100 dark:bg-gray-900';
      default:
        return 'bg-gray-100 dark:bg-gray-900';
    }
  };

  const getActivityBadgeColor = (type: ActivityType) => {
    switch (type) {
      case 'APPLICATION_RECEIVED':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'APPLICATION_APPROVED':
      case 'INTERVIEW_COMPLETED':
      case 'CANDIDATE_HIRED':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'APPLICATION_REJECTED':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'APPLICATION_SHORTLISTED':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'INTERVIEW_SCHEDULED':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      case 'JOB_POSTED':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'JOB_UPDATED':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatActivityType = (type: ActivityType) => {
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return new Date(date).toLocaleDateString();
  };

  const getActivityLink = (activity: PrismaActivity) => {
    if (activity.applicationId) {
      return `/school/applications/${activity.applicationId}`;
    }
    if (activity.jobId) {
      return `/school/jobs/${activity.jobId}`;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-xl">Activity Feed</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedActivities.length > 0 ? (
            <>
              {displayedActivities.map((activity) => {
                const link = getActivityLink(activity);
                const content = (
                  <div
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      link ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">
                          {activity.title}
                        </h4>
                        <Badge
                          variant="secondary"
                          className={`text-xs shrink-0 ${getActivityBadgeColor(activity.type)}`}
                        >
                          {formatActivityType(activity.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">
                        {activity.description}
                      </p>
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                );

                return link ? (
                  <Link key={activity.id} href={link}>
                    {content}
                  </Link>
                ) : (
                  <div key={activity.id}>{content}</div>
                );
              })}
              {activities.length > limit && (
                <div className="pt-2 border-t text-center">
                  <Link
                    href="/school/activity"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View all activity ({activities.length})
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
