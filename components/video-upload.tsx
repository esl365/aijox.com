/**
 * Video Upload Component for Agent 1: AI Screener
 *
 * Allows teachers to upload video resumes and view analysis results
 */

'use client';

import { useState } from 'react';
import { UploadButton } from '@/lib/uploadthing';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Video, AlertCircle } from 'lucide-react';

type UploadStatus = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

interface VideoUploadProps {
  profileId: string;
  currentVideoUrl?: string;
  analysisStatus?: 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
}

export function VideoUpload({
  profileId,
  currentVideoUrl,
  analysisStatus
}: VideoUploadProps) {
  const router = useRouter();
  const [status, setStatus] = useState<UploadStatus>(
    analysisStatus === 'ANALYZING' ? 'analyzing' :
    analysisStatus === 'COMPLETED' ? 'complete' : 'idle'
  );
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Resume
        </CardTitle>
        <CardDescription>
          Record a 2-3 minute introduction. Schools want to see your personality and teaching style.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Video Preview */}
        {currentVideoUrl && (
          <div className="space-y-2">
            <video
              src={currentVideoUrl}
              controls
              className="w-full rounded-lg border"
              style={{ maxHeight: '300px' }}
            />
            <div className="flex items-center justify-between">
              <StatusBadge status={analysisStatus} />
              {analysisStatus === 'COMPLETED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/profile/${profileId}#analysis`)}
                >
                  View Analysis
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Upload Guidelines */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Tips for a great video:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Record in a quiet room with good lighting</li>
              <li>Dress professionally (as for an interview)</li>
              <li>Introduce yourself and your teaching experience</li>
              <li>Explain why you love teaching and your subject areas</li>
              <li>Keep it under 5 minutes</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Upload Status */}
        {status === 'uploading' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading video... {uploadProgress}%
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {status === 'analyzing' && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              AI is analyzing your video... This may take 30-60 seconds.
            </AlertDescription>
          </Alert>
        )}

        {status === 'complete' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Video analyzed successfully! Check your results below.
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <UploadButton
          endpoint="videoResume"
          onClientUploadComplete={(res) => {
            console.log('Upload complete:', res);
            setStatus('analyzing');
            setUploadProgress(100);

            // Refresh page after 5 seconds to show analysis
            setTimeout(() => {
              router.refresh();
            }, 5000);
          }}
          onUploadError={(error) => {
            console.error('Upload error:', error);
            setError(error.message);
            setStatus('error');
          }}
          onUploadProgress={(progress) => {
            setUploadProgress(progress);
            setStatus('uploading');
          }}
          appearance={{
            button: 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium',
            allowedContent: 'text-sm text-muted-foreground'
          }}
        />

        {/* Re-record Option */}
        {currentVideoUrl && analysisStatus === 'COMPLETED' && (
          <p className="text-sm text-muted-foreground">
            Want to improve your score? Upload a new video to replace the current one.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status?: string }) {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3" />
          Pending
        </Badge>
      );
    case 'ANALYZING':
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Analyzing...
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Analyzed
        </Badge>
      );
    case 'FAILED':
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return null;
  }
}
