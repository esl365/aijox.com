'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteReport } from '@/app/actions/reports';

interface DeleteReportButtonProps {
  reportId: string;
}

export function DeleteReportButton({ reportId }: DeleteReportButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteReport(reportId);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete report');
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
