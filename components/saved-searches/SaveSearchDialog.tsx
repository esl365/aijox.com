'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createSavedSearch } from '@/app/actions/saved-searches';
import type { JobFilters } from '@/app/actions/jobs';
import {
  ALERT_FREQUENCIES,
  generateSearchSummary,
  type AlertFrequency,
} from '@/lib/types/saved-search';

type SaveSearchDialogProps = {
  filters: JobFilters;
  trigger?: React.ReactNode;
};

export function SaveSearchDialog({ filters, trigger }: SaveSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [alertFrequency, setAlertFrequency] = useState<AlertFrequency>(
    ALERT_FREQUENCIES.DAILY
  );
  const [alertEmail, setAlertEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const defaultName = generateSearchSummary(filters);

  const handleSave = async () => {
    setLoading(true);

    const result = await createSavedSearch({
      name: name.trim() || defaultName,
      filters,
      alertEmail,
      alertFrequency,
    });

    if (result.success) {
      toast({
        title: 'Search Saved',
        description: 'You will receive alerts for new matching jobs',
      });
      setOpen(false);
      setName('');
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            Save This Search
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save Job Search</DialogTitle>
          <DialogDescription>
            Get notified when new jobs match your criteria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search Summary */}
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-1">Search criteria:</p>
            <p className="text-sm text-muted-foreground">{defaultName}</p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Search name (optional)
            </Label>
            <Input
              id="name"
              placeholder={defaultName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Give this search a memorable name
            </p>
          </div>

          {/* Alert Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Alert frequency</Label>
            <Select
              value={alertFrequency}
              onValueChange={(value) =>
                setAlertFrequency(value as AlertFrequency)
              }
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALERT_FREQUENCIES.INSTANT}>
                  Instant - As soon as jobs are posted
                </SelectItem>
                <SelectItem value={ALERT_FREQUENCIES.DAILY}>
                  Daily - Morning digest at 9 AM
                </SelectItem>
                <SelectItem value={ALERT_FREQUENCIES.WEEKLY}>
                  Weekly - Monday mornings
                </SelectItem>
                <SelectItem value={ALERT_FREQUENCIES.NEVER}>
                  Never - Just save the search
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email Alerts Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="alertEmail"
              checked={alertEmail}
              onChange={(e) => setAlertEmail(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="alertEmail" className="cursor-pointer">
              Send email notifications
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Search'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
