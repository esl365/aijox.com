'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ExternalLink, Building2, User } from 'lucide-react';
import { verifySchool, verifyRecruiter, rejectVerification } from '@/app/actions/verification';
import type { VerificationRequest } from '@/app/actions/verification';
import { formatDistanceToNow } from 'date-fns';

interface VerificationTableProps {
  requests: VerificationRequest[];
}

export function VerificationTable({ requests: initialRequests }: VerificationTableProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleVerify = async (request: VerificationRequest) => {
    setProcessing(request.id);

    const result =
      request.type === 'SCHOOL'
        ? await verifySchool(request.entityId)
        : await verifyRecruiter(request.entityId);

    if (result.success) {
      // Remove from list
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
    } else {
      alert(result.error || 'Failed to verify');
    }

    setProcessing(null);
  };

  const handleReject = async (request: VerificationRequest) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(request.id);

    const result = await rejectVerification(
      request.type,
      request.entityId,
      rejectReason
    );

    if (result.success) {
      // Remove from list
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      setRejecting(null);
      setRejectReason('');
    } else {
      alert(result.error || 'Failed to reject verification');
    }

    setProcessing(null);
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      high: { color: 'bg-green-100 text-green-700', label: 'High Confidence' },
      medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Manual Review' },
      low: { color: 'bg-red-100 text-red-700', label: 'Needs Verification' },
    };

    const variant = variants[confidence] || variants.low;

    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${variant.color}`}>
        {variant.label}
      </span>
    );
  };

  if (requests.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold">All Caught Up!</h3>
          <p className="text-sm text-muted-foreground mt-2">
            No pending verification requests at the moment.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Type
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Name
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Email / Domain
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Submitted
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {request.type === 'SCHOOL' ? (
                      <Building2 className="h-5 w-5 text-blue-600" />
                    ) : (
                      <User className="h-5 w-5 text-purple-600" />
                    )}
                    <span className="font-medium text-sm">{request.type}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium">{request.entityName}</p>
                    {request.website && (
                      <a
                        href={request.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {request.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="text-sm font-mono">{request.userEmail}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">
                        {request.domain}
                      </code>
                      {request.isEducational && (
                        <Badge variant="secondary" className="text-xs">
                          .edu
                        </Badge>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  {getConfidenceBadge(request.confidence)}
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                </td>
                <td className="py-4 px-4">
                  {rejecting === request.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Reason for rejection..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request)}
                          disabled={processing === request.id}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRejecting(null);
                            setRejectReason('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleVerify(request)}
                        disabled={processing === request.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejecting(request.id)}
                        disabled={processing === request.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
