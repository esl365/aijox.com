import Link from 'next/link';
import type { JobPosting } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

type JobCardProps = {
  job: JobPosting;
  showApplyButton?: boolean;
};

export function JobCard({ job, showApplyButton = true }: JobCardProps) {
  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link
              href={`/jobs/${job.id}`}
              className="hover:underline"
            >
              <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
            </Link>
            <p className="text-muted-foreground">
              {job.schoolName} • {job.city}, {job.country}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {formatSalary(job.salaryUSD)}
            </p>
            <p className="text-sm text-muted-foreground">per month</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Subject & Requirements */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{job.subject}</Badge>
          {job.minYearsExperience && (
            <Badge variant="outline">
              {job.minYearsExperience}+ years exp
            </Badge>
          )}
        </div>

        {/* Benefits */}
        {(job.housingProvided || job.flightProvided) && (
          <div className="flex gap-2 text-sm">
            {job.housingProvided && (
              <span className="flex items-center gap-1 text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Housing
              </span>
            )}
            {job.flightProvided && (
              <span className="flex items-center gap-1 text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Flight
              </span>
            )}
          </div>
        )}

        {/* Description Preview */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.description}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Posted {formatDate(job.createdAt)}
        </span>
        {showApplyButton && (
          <Link href={`/jobs/${job.id}`}>
            <Button>View Details</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
