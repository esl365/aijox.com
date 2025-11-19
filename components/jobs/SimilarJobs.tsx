'use client';

import { useEffect, useState } from 'react';
import { getSimilarJobs } from '@/app/actions/recommendations';
import { JobRecommendationCard } from './JobRecommendationCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { JobRecommendation } from '@/lib/db/job-recommendations';

type SimilarJobsProps = {
  jobId: string;
  limit?: number;
  className?: string;
};

export function SimilarJobs({ jobId, limit = 3, className = '' }: SimilarJobsProps) {
  const [jobs, setJobs] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSimilarJobs() {
      try {
        setLoading(true);
        setError(null);

        const result = await getSimilarJobs(jobId, limit);

        if (result.success) {
          setJobs(result.jobs);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load similar jobs');
      } finally {
        setLoading(false);
      }
    }

    loadSimilarJobs();
  }, [jobId, limit]);

  if (loading) {
    return (
      <div className={className}>
        <h3 className="text-xl font-bold mb-4">Similar Jobs</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <h3 className="text-xl font-bold mb-4">Similar Jobs</h3>
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (jobs.length === 0) {
    return null; // Don't show section if no similar jobs
  }

  return (
    <div className={className}>
      <h3 className="text-xl font-bold mb-4">Similar Jobs You Might Like</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <JobRecommendationCard key={job.id} job={job} showMatchScore={false} />
        ))}
      </div>
    </div>
  );
}
