'use client';

/**
 * JobCardV2 Component
 *
 * Enhanced job card based on Wellfound benchmark.
 * Features:
 * - School logo/avatar
 * - Prominent visa sponsorship badge
 * - Salary range (not hidden)
 * - Quick Apply button
 * - Save/Favorite functionality
 * - Hover elevation effect
 * - Featured/Urgent badges
 *
 * Usage:
 * <JobCardV2 job={jobData} onSave={handleSave} onQuickApply={handleApply} />
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  MapPin,
  Calendar,
  DollarSign,
  Heart,
  Briefcase,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { JobCardV2Props } from '@/lib/design-system';
import { cn } from '@/lib/utils';
import { shouldReduceMotion } from '@/lib/design-system';
import { formatDistanceToNow } from 'date-fns';

export function JobCardV2({
  job,
  variant = 'default',
  onSave,
  onQuickApply,
  isSaved = false,
  isApplied = false,
  showQuickApply = true,
  className,
  ...props
}: JobCardV2Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!onSave || isSaving) return;

    setIsSaving(true);
    try {
      await onSave(job.id);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickApply = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!onQuickApply || isApplying || isApplied) return;

    setIsApplying(true);
    try {
      await onQuickApply(job.id);
    } finally {
      setIsApplying(false);
    }
  };

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: job.currency,
      maximumFractionDigits: 0,
    });

    if (job.salaryMin && job.salaryMax) {
      return `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`;
    }

    return formatter.format(job.salaryMin || job.salaryMax || 0);
  };

  const getSchoolInitials = () => {
    return job.school
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const cardVariants: Variants = {
    initial: { y: 0, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' },
    hover: {
      y: -4,
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },
  };

  return (
    <motion.article
      variants={shouldReduceMotion() ? {} : cardVariants}
      initial="initial"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'group relative rounded-xl border bg-card p-6 transition-colors',
        'hover:border-primary/20 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
        variant === 'featured' && 'border-primary/30 bg-primary/5',
        variant === 'compact' && 'p-4',
        className
      )}
      data-testid="job-card"
      {...props}
    >
      {/* Badges Row */}
      <div className="mb-4 flex flex-wrap gap-2">
        {job.isFeatured && (
          <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
            Featured
          </Badge>
        )}
        {job.isUrgent && (
          <Badge variant="destructive">
            Urgent
          </Badge>
        )}
        {job.visaSponsorship && (
          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Visa Sponsorship
          </Badge>
        )}
        {isApplied && (
          <Badge variant="outline" className="border-emerald-500 text-emerald-700">
            Applied
          </Badge>
        )}
      </div>

      {/* Header: Logo + Title + Save Button */}
      <div className="mb-4 flex items-start gap-4">
        <Link href={`/jobs/${job.id}`} className="flex-1">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border">
              {job.schoolLogo ? (
                <AvatarImage src={job.schoolLogo} alt={job.school} />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getSchoolInitials()}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {job.school}
              </p>
            </div>
          </div>
        </Link>

        {/* Save Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            'flex-shrink-0',
            isSaved && 'text-red-500 hover:text-red-600'
          )}
          aria-label={isSaved ? 'Unsave job' : 'Save job'}
          aria-pressed={isSaved}
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-all',
              isSaved && 'fill-current'
            )}
          />
        </Button>
      </div>

      {/* Location & Contract Type */}
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>
            {job.city ? `${job.city}, ${job.country}` : job.country}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Briefcase className="h-4 w-4" />
          <span>{job.contractType.replace('_', ' ')}</span>
        </div>

        {job.startDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Start: {new Date(job.startDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Subjects */}
      {job.subjects && job.subjects.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {job.subjects.slice(0, 3).map((subject) => (
            <Badge
              key={subject}
              variant="secondary"
              className="text-xs"
            >
              {subject}
            </Badge>
          ))}
          {job.subjects.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{job.subjects.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Salary */}
      {formatSalary() && (
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          <span>{formatSalary()}</span>
          <span className="text-sm font-normal text-muted-foreground">
            /year
          </span>
        </div>
      )}

      {/* Footer: Stats + Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {job.applicantCount !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{job.applicantCount} applicants</span>
            </div>
          )}
          <span>
            Posted {formatDistanceToNow(job.postedAt, { addSuffix: true })}
          </span>
        </div>

        {/* Quick Apply Button */}
        {showQuickApply && (
          <Button
            onClick={handleQuickApply}
            disabled={isApplying || isApplied}
            size="sm"
            className={cn(
              'transition-all',
              isApplied && 'bg-emerald-600 hover:bg-emerald-700'
            )}
          >
            {isApplying && <span className="mr-2 h-4 w-4 animate-spin">⏳</span>}
            {isApplied ? (
              <>
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Applied
              </>
            ) : (
              'Quick Apply'
            )}
          </Button>
        )}
      </div>
    </motion.article>
  );
}

/**
 * JobCardV2Skeleton Component
 *
 * Loading skeleton for JobCardV2
 */
export function JobCardV2Skeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 animate-pulse">
      <div className="mb-4 flex gap-2">
        <div className="h-6 w-24 bg-muted rounded" />
        <div className="h-6 w-32 bg-muted rounded" />
      </div>

      <div className="mb-4 flex items-start gap-4">
        <div className="h-12 w-12 bg-muted rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <div className="h-10 w-10 bg-muted rounded" />
      </div>

      <div className="mb-3 space-y-2">
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>

      <div className="mb-3 flex gap-2">
        <div className="h-6 w-16 bg-muted rounded" />
        <div className="h-6 w-20 bg-muted rounded" />
        <div className="h-6 w-24 bg-muted rounded" />
      </div>

      <div className="mb-4">
        <div className="h-6 bg-muted rounded w-32" />
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-9 w-28 bg-muted rounded" />
      </div>
    </div>
  );
}
