import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  variant?: 'default' | 'compact';
}

export function VerifiedBadge({
  size = 'md',
  showLabel = true,
  className,
  variant = 'default',
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (variant === 'compact') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-green-600',
          className
        )}
        title="Verified Institution"
      >
        <CheckCircle2 className={cn(sizeClasses[size], 'fill-green-600 text-white')} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-green-700',
        textSizeClasses[size],
        className
      )}
    >
      <CheckCircle2 className={cn(sizeClasses[size], 'fill-green-600 text-white')} />
      {showLabel && <span className="font-medium">Verified</span>}
    </span>
  );
}

interface SchoolBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  className?: string;
}

export function SchoolBadge({
  isVerified,
  size = 'md',
  variant = 'default',
  className,
}: SchoolBadgeProps) {
  if (!isVerified) {
    return null;
  }

  return (
    <VerifiedBadge
      size={size}
      showLabel={variant === 'default'}
      variant={variant}
      className={className}
    />
  );
}

interface RecruiterBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  className?: string;
}

export function RecruiterBadge({
  isVerified,
  size = 'md',
  variant = 'default',
  className,
}: RecruiterBadgeProps) {
  if (!isVerified) {
    return null;
  }

  return (
    <VerifiedBadge
      size={size}
      showLabel={variant === 'default'}
      variant={variant}
      className={className}
    />
  );
}
