'use client';

import { useEffect, useState } from 'react';
import { getRecommendedJobs } from '@/app/actions/recommendations';
import { JobRecommendationCard } from './JobRecommendationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { JobRecommendation } from '@/lib/db/job-recommendations';

type RecommendedJobsProps = {
  limit?: number;
  minSimilarity?: number;
  showTitle?: boolean;
  className?: string;
};

export function RecommendedJobs({
  limit = 6,
  minSimilarity = 0.8,
  showTitle = true,
  className = '',
}: RecommendedJobsProps) {
  const [jobs, setJobs] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);
        setError(null);

        const result = await getRecommendedJobs(minSimilarity, limit);

        if (result.success) {
          setJobs(result.jobs);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [limit, minSimilarity]);

  if (loading) {
    return (
      <div className={className}>
        {showTitle && (
          <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-2 bg-muted rounded w-full" />
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
        {showTitle && (
          <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
        )}
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className={className}>
        {showTitle && (
          <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
        )}
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete your profile to get personalized job recommendations based on your
              preferences and qualifications.
            </p>
            <Button asChild>
              <a href="/profile">Complete Your Profile</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Recommended for You</h2>
            <p className="text-muted-foreground">
              Jobs matched to your profile with AI-powered recommendations
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="/jobs">Browse All Jobs</a>
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobRecommendationCard key={job.id} job={job} />
        ))}
      </div>

      {/* Match Quality Explanation */}
      <Card className="mt-6 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">How are jobs matched?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Our AI analyzes your profile, experience, qualifications, and preferences to
            recommend jobs that best match your teaching career goals. Match scores are
            calculated based on subject expertise, preferred locations, salary expectations,
            and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
