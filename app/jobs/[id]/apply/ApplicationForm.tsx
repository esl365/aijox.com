'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JobPosting } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { submitApplication } from '@/app/actions/applications';
import { useToast } from '@/hooks/use-toast';

type ApplicationFormProps = {
  job: JobPosting;
  validation: any;
  teacherId: string;
};

export function ApplicationForm({ job, validation }: ApplicationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await submitApplication({
      jobId: job.id,
      coverLetter: coverLetter.trim() || undefined
    });

    if (result.success) {
      toast({
        title: 'Application Submitted',
        description: result.message,
      });
      router.push('/dashboard');
    } else {
      toast({
        title: 'Submission Failed',
        description: result.message,
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          ← Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Apply for Position</h1>
        <p className="text-muted-foreground">
          Review the details and submit your application
        </p>
      </div>

      {/* Job Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <CardDescription>
            {job.schoolName} • {job.city}, {job.country}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatSalary(job.salaryUSD)}
              </p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{job.subject}</Badge>
              {job.housingProvided && (
                <Badge variant="outline">Housing</Badge>
              )}
              {job.flightProvided && <Badge variant="outline">Flight</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eligibility Status */}
      {validation.checks && (
        <Card>
          <CardHeader>
            <CardTitle>Eligibility Check</CardTitle>
            <CardDescription>
              Your qualifications have been verified for this position
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Visa Eligibility</span>
              <Badge
                variant={
                  validation.checks.visaEligible ? 'default' : 'destructive'
                }
              >
                {validation.checks.visaEligible ? 'Eligible' : 'Not Eligible'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Experience Match</span>
              <Badge
                variant={
                  validation.checks.experienceMatch ? 'default' : 'secondary'
                }
              >
                {validation.checks.experienceMatch ? 'Qualified' : 'Review'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Subject Match</span>
              <Badge
                variant={
                  validation.checks.subjectMatch ? 'default' : 'secondary'
                }
              >
                {validation.checks.subjectMatch ? 'Match' : 'Different'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {validation.checks && !validation.checks.subjectMatch && (
        <Alert>
          <AlertTitle>Subject Difference</AlertTitle>
          <AlertDescription>
            This position is for {job.subject}, which differs from your primary
            teaching subjects. You can still apply, but make sure to highlight
            relevant experience in your cover letter.
          </AlertDescription>
        </Alert>
      )}

      {validation.checks && !validation.checks.salaryMatch && (
        <Alert>
          <AlertTitle>Salary Below Preference</AlertTitle>
          <AlertDescription>
            This position's salary is below your stated minimum preference.
            Consider if this opportunity still meets your needs.
          </AlertDescription>
        </Alert>
      )}

      {/* Application Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Cover Letter (Optional)</CardTitle>
            <CardDescription>
              Introduce yourself and explain why you're a great fit for this
              position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Your Message</Label>
              <textarea
                id="coverLetter"
                className="w-full min-h-[200px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Dear Hiring Manager,&#10;&#10;I am excited to apply for this position because..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                maxLength={2000}
              />
              <p className="text-sm text-muted-foreground text-right">
                {coverLetter.length}/2000 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Card className="mt-6">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="font-semibold mb-1">Ready to submit?</p>
              <p className="text-sm text-muted-foreground">
                Your profile and video resume will be included automatically
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} size="lg">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
