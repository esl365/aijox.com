import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Calendar, Briefcase, Home, Plane } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    schoolName: string;
    isAnonymous: boolean;
    country: string;
    city: string;
    salaryUSD: number;
    subject: string;
    minYearsExperience?: number;
    housingProvided: boolean;
    flightProvided: boolean;
    startDate?: Date;
    createdAt: Date;
  };
  matchScore?: number;
  visaEligible?: boolean;
  variant?: 'default' | 'compact';
}

export function JobCard({ job, matchScore, visaEligible, variant = 'default' }: JobCardProps) {
  const isCompact = variant === 'compact';

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isCompact ? 'p-4' : ''}`}>
      <CardHeader className={isCompact ? 'p-0 mb-3' : ''}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className={isCompact ? 'text-lg' : 'text-xl'}>
              {job.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {job.isAnonymous ? 'Confidential School' : job.schoolName}
            </CardDescription>
          </div>
          {matchScore && (
            <Badge variant="default" className="bg-primary">
              {matchScore}% Match
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className={isCompact ? 'p-0 space-y-2' : 'space-y-3'}>
        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{job.city}, {job.country}</span>
          {visaEligible !== undefined && (
            <Badge
              variant="outline"
              className={visaEligible ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
            >
              {visaEligible ? 'Visa OK' : 'Visa Issue'}
            </Badge>
          )}
        </div>

        {/* Salary */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span>{formatCurrency(job.salaryUSD)}/month</span>
        </div>

        {/* Subject & Experience */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            <Briefcase className="h-3 w-3 mr-1" />
            {job.subject}
          </Badge>
          {job.minYearsExperience && (
            <Badge variant="outline">
              {job.minYearsExperience}+ years exp
            </Badge>
          )}
        </div>

        {/* Benefits */}
        {!isCompact && (job.housingProvided || job.flightProvided) && (
          <div className="flex gap-2 pt-2">
            {job.housingProvided && (
              <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                <Home className="h-3 w-3" />
                Housing
              </div>
            )}
            {job.flightProvided && (
              <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                <Plane className="h-3 w-3" />
                Flight
              </div>
            )}
          </div>
        )}

        {/* Start Date */}
        {!isCompact && job.startDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Start: {formatDate(job.startDate)}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className={`flex justify-between ${isCompact ? 'p-0 mt-3' : 'mt-4'}`}>
        <span className="text-xs text-muted-foreground">
          Posted {formatDate(job.createdAt)}
        </span>
        <Link href={`/jobs/${job.id}`}>
          <Button size={isCompact ? 'sm' : 'default'}>
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Grid view for job listings
export function JobCardGrid({ jobs, ...props }: { jobs: JobCardProps['job'][] } & Omit<JobCardProps, 'job'>) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} {...props} />
      ))}
    </div>
  );
}

// List view (compact)
export function JobCardList({ jobs, ...props }: { jobs: JobCardProps['job'][] } & Omit<JobCardProps, 'job'>) {
  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} variant="compact" {...props} />
      ))}
    </div>
  );
}
