'use client';

import { useMemo } from 'react';
import { calculatePasswordStrength } from '@/lib/validations/auth';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const { score, feedback } = useMemo(
    () => (password ? calculatePasswordStrength(password) : { score: 'weak' as const, feedback: [] }),
    [password]
  );

  if (!password) {
    return null;
  }

  const strengthConfig = {
    weak: {
      color: 'bg-red-500',
      text: 'text-red-700',
      label: 'Weak',
      width: 'w-1/3',
    },
    medium: {
      color: 'bg-yellow-500',
      text: 'text-yellow-700',
      label: 'Medium',
      width: 'w-2/3',
    },
    strong: {
      color: 'bg-green-500',
      text: 'text-green-700',
      label: 'Strong',
      width: 'w-full',
    },
  };

  const config = strengthConfig[score];

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', config.color, config.width)}
          />
        </div>
        <span className={cn('text-sm font-medium', config.text)}>{config.label}</span>
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {feedback.map((item, index) => (
            <li key={index} className="flex items-start gap-1">
              <span className="text-gray-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
