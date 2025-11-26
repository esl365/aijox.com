'use client';

import { Button } from '@/components/ui/button';

interface StickyApplyBarProps {
  salary: number;
  onApply: () => void;
  disabled?: boolean;
}

export function StickyApplyBar({
  salary,
  onApply,
  disabled = false,
}: StickyApplyBarProps) {
  const formatSalary = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 lg:hidden">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatSalary(salary)}/mo
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Monthly salary
          </p>
        </div>

        <Button
          size="lg"
          onClick={onApply}
          disabled={disabled}
          className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8"
        >
          {disabled ? 'Checking...' : 'Apply Now'}
        </Button>
      </div>
    </div>
  );
}
