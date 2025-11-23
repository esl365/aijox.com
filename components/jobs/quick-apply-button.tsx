'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle, Loader2 } from 'lucide-react';

interface QuickApplyButtonProps {
  jobId: string;
  jobTitle: string;
  profileComplete?: boolean;
}

/**
 * One-Click Apply Button - Task 1.5
 * Allows users with complete profiles to apply quickly
 */
export function QuickApplyButton({ jobId, jobTitle, profileComplete = false }: QuickApplyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleQuickApply = async () => {
    setIsApplying(true);

    try {
      // TODO: Implement actual application submission
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call

      setApplied(true);
      setTimeout(() => {
        setIsOpen(false);
        setApplied(false);
      }, 2000);
    } catch (error) {
      console.error('Quick apply error:', error);
    } finally {
      setIsApplying(false);
    }
  };

  if (!profileComplete) {
    return (
      <Button asChild variant="outline">
        <a href={`/jobs/${jobId}/apply`}>Apply Now</a>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">Quick Apply</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Apply</DialogTitle>
          <DialogDescription>
            Apply to {jobTitle} with your saved profile
          </DialogDescription>
        </DialogHeader>
        {!applied ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your profile information will be sent to the employer.
              You can track your application status in your dashboard.
            </p>
            <Button
              onClick={handleQuickApply}
              disabled={isApplying}
              className="w-full"
            >
              {isApplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                'Confirm Application'
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-semibold">Application Submitted!</p>
            <p className="text-sm text-muted-foreground">
              We'll notify you of any updates.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
