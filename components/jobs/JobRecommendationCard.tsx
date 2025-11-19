import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { JobRecommendation } from '@/lib/db/job-recommendations';

type JobRecommendationCardProps = {
  job: JobRecommendation;
  showMatchScore?: boolean;
};

export function JobRecommendationCard({
  job,
  showMatchScore = true,
}: JobRecommendationCardProps) {
  const matchScoreColor =
    job.matchScore >= 90
      ? 'text-green-600 dark:text-green-400'
      : job.matchScore >= 80
        ? 'text-blue-600 dark:text-blue-400'
        : job.matchScore >= 70
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-gray-600 dark:text-gray-400';

  const matchScoreBgColor =
    job.matchScore >= 90
      ? 'bg-green-500'
      : job.matchScore >= 80
        ? 'bg-blue-500'
        : job.matchScore >= 70
          ? 'bg-yellow-500'
          : 'bg-gray-500';

  return (
    <Card className="hover:border-primary/50 transition-colors h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link
              href={`/jobs/${job.id}`}
              className="hover:text-primary transition-colors"
            >
              <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
            </Link>
            <p className="text-muted-foreground">{job.schoolName}</p>
            <p className="text-sm text-muted-foreground">
              📍 {job.city}, {job.country}
            </p>
          </div>
          {showMatchScore && (
            <div className="text-center">
              <div className={`text-2xl font-bold ${matchScoreColor}`}>
                {job.matchScore}%
              </div>
              <p className="text-xs text-muted-foreground">Match</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Match Score Progress Bar */}
          {showMatchScore && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`${matchScoreBgColor} h-2 rounded-full transition-all`}
                style={{ width: `${job.matchScore}%` }}
              />
            </div>
          )}

          {/* Job Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Subject</p>
              <p className="font-medium">{job.subject}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Salary</p>
              <p className="font-medium">${job.salaryUSD.toLocaleString()}/mo</p>
            </div>
          </div>

          {/* Benefits */}
          {(job.housingProvided || job.flightProvided) && (
            <div className="flex flex-wrap gap-2">
              {job.housingProvided && (
                <Badge variant="secondary" className="text-xs">
                  🏠 Housing
                </Badge>
              )}
              {job.flightProvided && (
                <Badge variant="secondary" className="text-xs">
                  ✈️ Flight
                </Badge>
              )}
            </div>
          )}

          {/* Description Preview */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link href={`/jobs/${job.id}`} className="flex-1">
              <Button variant="default" className="w-full" size="sm">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
