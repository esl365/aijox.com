'use client';

/**
 * QuickApplyModal Component
 *
 * One-click apply modal with profile completeness check.
 *
 * Algorithm:
 * 1. User clicks "Quick Apply"
 * 2. Open modal with loading state
 * 3. Fetch profile completeness
 * 4. IF completeness < 80%:
 *    - Show ProfileCompletenessCheck component
 *    - List missing fields
 *    - CTA: "Complete Profile"
 * 5. ELSE:
 *    - Show ApplicationConfirmation component
 *    - Display profile summary
 *    - Display job summary
 *    - CTA: "Confirm Application"
 * 6. ON CONFIRM:
 *    - Optimistic UI update (button → "Applying...")
 *    - POST /api/jobs/:id/apply
 *    - ON SUCCESS:
 *      - Show success toast
 *      - Update job card state
 *      - Show similar jobs
 *    - ON ERROR:
 *      - Rollback optimistic update
 *      - Show error toast
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  MapPin,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import { useQuickApply } from '@/lib/stores/ui-store';
import { useJob, useApplyToJob } from '@/lib/hooks/use-jobs';
import { useCurrentProfile, useProfileCompleteness } from '@/lib/hooks/use-profile';
import { useToasts } from '@/lib/stores/ui-store';
import { cn } from '@/lib/utils';

export function QuickApplyModal() {
  const { jobId, close } = useQuickApply();
  const { data: job, isLoading: jobLoading } = useJob(jobId);
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: completeness, isLoading: completenessLoading } = useProfileCompleteness();
  const { mutate: apply, isPending: isApplying } = useApplyToJob();
  const { add: addToast } = useToasts();

  const [step, setStep] = useState<'check' | 'confirm' | 'success'>('check');

  const isLoading = jobLoading || profileLoading || completenessLoading;

  const handleApply = async () => {
    if (!jobId) return;

    apply(jobId, {
      onSuccess: () => {
        setStep('success');
        addToast({
          type: 'success',
          title: 'Application submitted!',
          description: 'The employer will review your profile.',
        });

        // Close modal after 2 seconds
        setTimeout(() => {
          close();
          setStep('check'); // Reset for next use
        }, 2000);
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Application failed',
          description: error.message || 'Please try again later.',
        });
      },
    });
  };

  if (!jobId) return null;

  return (
    <Dialog open={!!jobId} onOpenChange={close}>
      <DialogContent className="max-w-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : step === 'check' && completeness && completeness.completeness < 80 ? (
          <ProfileCompletenessCheck
            profile={profile}
            completeness={completeness}
            onClose={close}
          />
        ) : step === 'success' ? (
          <ApplicationSuccess job={job} />
        ) : (
          <ApplicationConfirmation
            job={job}
            profile={profile}
            onConfirm={handleApply}
            onCancel={close}
            isLoading={isApplying}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * ProfileCompletenessCheck Component
 */
function ProfileCompletenessCheck({
  profile,
  completeness,
  onClose,
}: any) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Complete Your Profile
        </DialogTitle>
        <DialogDescription>
          Your profile needs to be at least 80% complete to apply for jobs.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Profile Completeness</span>
            <span className="text-muted-foreground">
              {completeness.completeness}%
            </span>
          </div>
          <Progress value={completeness.completeness} className="h-2" />
        </div>

        {/* Missing Fields */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Missing Information</h3>
          <ul className="space-y-2">
            {completeness.missingFields.map((field: string) => (
              <li
                key={field}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => window.location.href = '/profile/edit'}
            className="flex-1"
          >
            Complete Profile
          </Button>
        </div>
      </div>
    </>
  );
}

/**
 * ApplicationConfirmation Component
 */
function ApplicationConfirmation({
  job,
  profile,
  onConfirm,
  onCancel,
  isLoading,
}: any) {
  if (!job || !profile) return null;

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return 'Not specified';

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: job.currency || 'USD',
      maximumFractionDigits: 0,
    });

    if (job.salaryMin && job.salaryMax) {
      return `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`;
    }

    return formatter.format(job.salaryMin || job.salaryMax || 0);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Confirm Application</DialogTitle>
        <DialogDescription>
          Review your application before submitting
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Job Summary */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
          <h3 className="font-semibold text-lg">{job.title}</h3>
          <p className="text-sm text-muted-foreground">{job.school}</p>

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.country}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{formatSalary()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>{job.contractType?.replace('_', ' ')}</span>
            </div>
          </div>

          {job.visaSponsorship && (
            <Badge className="bg-emerald-500">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Visa Sponsorship
            </Badge>
          )}
        </div>

        {/* Profile Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Your Profile</h3>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback>
                {profile.name?.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div>
                <p className="font-semibold">{profile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {profile.yearsExperience} years experience
                </p>
              </div>

              {profile.subjects && profile.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {profile.subjects.slice(0, 3).map((subject: string) => (
                    <Badge key={subject} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                  {profile.subjects.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{profile.subjects.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Included Documents */}
        <div className="space-y-2 rounded-lg border p-3 text-sm">
          <p className="font-medium">Application includes:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Profile information
            </li>
            {profile.videoUrl && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Video resume
              </li>
            )}
            {profile.resumeUrl && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                CV/Resume
              </li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              'Confirm Application'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

/**
 * ApplicationSuccess Component
 */
function ApplicationSuccess({ job }: any) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-6 rounded-full bg-emerald-100 p-4"
      >
        <CheckCircle2 className="h-16 w-16 text-emerald-600" />
      </motion.div>

      <h2 className="mb-2 text-2xl font-bold">Application Submitted!</h2>
      <p className="mb-6 text-muted-foreground">
        Your application for <span className="font-semibold">{job?.title}</span> has been sent to{' '}
        <span className="font-semibold">{job?.school}</span>.
      </p>

      <div className="rounded-lg border bg-muted/50 p-4 text-sm">
        <p className="font-medium mb-1">What's next?</p>
        <ul className="space-y-1 text-left text-muted-foreground">
          <li>• The employer will review your profile</li>
          <li>• You'll be notified of any updates</li>
          <li>• Check your dashboard for application status</li>
        </ul>
      </div>
    </motion.div>
  );
}
