import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Application, JobPosting } from '@prisma/client';

type ApplicationWithJob = Application & {
  job: JobPosting;
};

type ApplicationCardProps = {
  application: ApplicationWithJob;
};

const STATUS_COLORS = {
  NEW: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  SCREENING:
    'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
  INTERVIEW:
    'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  OFFER:
    'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
  HIRED:
    'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border-emerald-600/20',
  REJECTED: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
} as const;

const STATUS_LABELS = {
  NEW: 'Submitted',
  SCREENING: 'Under Review',
  INTERVIEW: 'Interview',
  OFFER: 'Offer Received',
  HIRED: 'Hired',
  REJECTED: 'Not Selected',
} as const;

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { job, status, createdAt, aiMatchScore } = application;

  return (
    <Card className="hover:border-primary/50 transition-colors">
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
              📍 {job.country}
              {job.city && `, ${job.city}`}
            </p>
          </div>
          <Badge
            variant="outline"
            className={STATUS_COLORS[status]}
          >
            {STATUS_LABELS[status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Application Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Applied</p>
              <p className="font-medium">
                {format(new Date(createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
            {aiMatchScore !== null && aiMatchScore !== undefined && (
              <div>
                <p className="text-muted-foreground">Match Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${aiMatchScore}%` }}
                    />
                  </div>
                  <p className="font-medium text-sm">{aiMatchScore}%</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Salary</p>
              <p className="font-medium">
                ${job.salaryUSD.toLocaleString()}/mo
              </p>
            </div>
          </div>

          {/* Job Benefits */}
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

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link href={`/applications/${application.id}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                View Details
              </Button>
            </Link>
            <Link href={`/jobs/${job.id}`}>
              <Button variant="ghost" size="sm">
                View Job
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
