'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckSquare,
  X,
  Check,
  UserPlus,
  Tag,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import {
  bulkUpdateStatus,
  bulkAssignCandidates,
  bulkAddTags,
  bulkDeleteApplications
} from '@/app/actions/bulk-actions';
import { useRouter } from 'next/navigation';
import { ApplicationStatus } from '@prisma/client';

interface BulkActionsBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  teamMembers?: {
    id: string;
    name: string | null;
    email: string;
  }[];
}

export function BulkActionsBar({
  selectedIds,
  onClearSelection,
  teamMembers = []
}: BulkActionsBarProps) {
  const [showActions, setShowActions] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleBulkStatus = async (status: ApplicationStatus) => {
    startTransition(async () => {
      try {
        const result = await bulkUpdateStatus(selectedIds, status);
        if (result.success) {
          onClearSelection();
          router.refresh();
        }
      } catch (error) {
        console.error('Bulk status update failed:', error);
      }
    });
    setShowStatusMenu(false);
  };

  const handleBulkAssign = async (assignedToId: string) => {
    startTransition(async () => {
      try {
        const result = await bulkAssignCandidates(selectedIds, assignedToId);
        if (result.success) {
          onClearSelection();
          router.refresh();
        }
      } catch (error) {
        console.error('Bulk assign failed:', error);
      }
    });
    setShowAssignMenu(false);
  };

  const handleBulkAddTag = async () => {
    if (!tagInput.trim()) return;

    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    if (tags.length === 0) return;

    startTransition(async () => {
      try {
        const result = await bulkAddTags(selectedIds, tags);
        if (result.success) {
          setTagInput('');
          setShowTagInput(false);
          onClearSelection();
          router.refresh();
        }
      } catch (error) {
        console.error('Bulk tag failed:', error);
      }
    });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} applications?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await bulkDeleteApplications(selectedIds);
        if (result.success) {
          onClearSelection();
          router.refresh();
        }
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    });
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-full border-2 border-blue-500 px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Selected Count */}
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <Badge variant="default" className="text-sm">
              {selectedIds.length} selected
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 border-l pl-4">
            {/* Update Status */}
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                disabled={isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Status
              </Button>
              {showStatusMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg border p-2 min-w-[150px]">
                  {(['SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'] as ApplicationStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleBulkStatus(status)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assign To */}
            {teamMembers.length > 0 && (
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAssignMenu(!showAssignMenu)}
                  disabled={isPending}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Assign
                </Button>
                {showAssignMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg border p-2 min-w-[200px] max-h-[300px] overflow-y-auto">
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => handleBulkAssign(member.id)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {member.name || member.email}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add Tags */}
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTagInput(!showTagInput)}
                disabled={isPending}
              >
                <Tag className="h-4 w-4 mr-1" />
                Tags
              </Button>
              {showTagInput && (
                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg border p-3 min-w-[250px]">
                  <input
                    type="text"
                    placeholder="Enter tags (comma separated)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleBulkAddTag();
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border rounded mb-2"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleBulkAddTag}
                    disabled={!tagInput.trim()}
                    className="w-full"
                  >
                    Add Tags
                  </Button>
                </div>
              )}
            </div>

            {/* Delete */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkDelete}
              disabled={isPending}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            disabled={isPending}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
