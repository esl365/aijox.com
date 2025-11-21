'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteEmailAutomation } from '@/app/actions/email-automation';

interface DeleteAutomationButtonProps {
  automationId: string;
}

export function DeleteAutomationButton({ automationId }: DeleteAutomationButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this automation?')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteEmailAutomation(automationId);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete automation');
      setIsDeleting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4 text-red-600" />
    </Button>
  );
}
