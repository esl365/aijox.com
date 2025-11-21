'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, Phone, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { InterviewType } from '@prisma/client';
import { TodayInterview } from '@/app/actions/interviews';

interface TodayScheduleWidgetProps {
  interviews: TodayInterview[];
}

export function TodayScheduleWidget({ interviews }: TodayScheduleWidgetProps) {
  const getInterviewIcon = (type: InterviewType) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'PHONE':
        return <Phone className="h-4 w-4" />;
      case 'IN_PERSON':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getInterviewTypeColor = (type: InterviewType) => {
    switch (type) {
      case 'VIDEO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'PHONE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'IN_PERSON':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeUntil = (date: Date) => {
    const now = new Date();
    const diffInMs = new Date(date).getTime() - now.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 0) return 'In progress';
    if (diffInMinutes < 60) return `In ${diffInMinutes}m`;
    return `In ${diffInHours}h ${diffInMinutes % 60}m`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-xl">Today's Schedule</CardTitle>
          {interviews.length > 0 && (
            <Badge variant="default" className="ml-auto">
              {interviews.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {interviews.length > 0 ? (
            <>
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getInterviewTypeColor(interview.type)}`}
                      >
                        <span className="mr-1">{getInterviewIcon(interview.type)}</span>
                        {interview.type}
                      </Badge>
                      <span className="text-sm font-semibold">
                        {formatTime(interview.scheduledAt)}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getTimeUntil(interview.scheduledAt)}
                    </Badge>
                  </div>

                  <Link href={`/school/applications/${interview.applicationId}`}>
                    <div className="mb-1">
                      <h4 className="font-semibold text-sm hover:text-blue-600 transition-colors">
                        {interview.candidateName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {interview.jobTitle}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {interview.duration} min
                    </span>
                    {interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs ml-auto"
                        >
                          Join Meeting
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No interviews scheduled for today</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
