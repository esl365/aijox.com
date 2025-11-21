'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Power, PowerOff } from 'lucide-react';
import { toggleEmailAutomation } from '@/app/actions/email-automation';

interface ToggleAutomationButtonProps {
  automationId: string;
  isActive: boolean;
}

export function ToggleAutomationButton({ automationId, isActive }: ToggleAutomationButtonProps) {
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setIsToggling(true);
    const result = await toggleEmailAutomation(automationId, !isActive);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to toggle automation');
      setIsToggling(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isToggling}
      className="gap-2"
    >
      {isActive ? (
        <>
          <PowerOff className="h-4 w-4" />
          Disable
        </>
      ) : (
        <>
          <Power className="h-4 w-4" />
          Enable
        </>
      )}
    </Button>
  );
}
