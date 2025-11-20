import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Video, Upload, Play, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Video Resume',
  description: 'Upload and manage your teaching video resume',
};

export default async function VideoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/profile/video');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-2">Video Resume</h1>
            <p className="text-muted-foreground">Showcase your teaching skills with a video introduction</p>
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Your Video
            </CardTitle>
            <CardDescription>
              Record a 2-3 minute video introducing yourself and your teaching philosophy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
              <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Drop your video here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse (Max 100MB, MP4/MOV/WEBM)
              </p>
              <Button>Choose File</Button>
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-sm">Tips for a great video:</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Keep it between 2-3 minutes</li>
                <li>• Use good lighting and clear audio</li>
                <li>• Dress professionally</li>
                <li>• Choose a clean, uncluttered background</li>
                <li>• Make eye contact with the camera</li>
                <li>• Introduce yourself, your experience, and teaching philosophy</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Current Video */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Current Video
            </CardTitle>
            <CardDescription>Last uploaded 5 days ago</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
              <div className="text-white text-center">
                <Play className="h-16 w-16 mx-auto mb-4 opacity-75" />
                <p className="text-sm opacity-75">Video Preview</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Play className="h-4 w-4" />
                Preview
              </Button>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Replace Video
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Analysis Results
            </CardTitle>
            <CardDescription>Feedback from our AI Screener</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-5xl font-bold text-primary mb-2">85/100</div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>

            {/* Detailed Scores */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm">Accent & Pronunciation</span>
                  <span className="text-sm font-semibold">8/10</span>
                </div>
                <Progress value={80} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Clear North American accent, excellent clarity</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm">Energy & Enthusiasm</span>
                  <span className="text-sm font-semibold">9/10</span>
                </div>
                <Progress value={90} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">High energy, passionate about teaching</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm">Professionalism</span>
                  <span className="text-sm font-semibold">8/10</span>
                </div>
                <Progress value={80} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Professional appearance and setting</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm">Technical Quality</span>
                  <span className="text-sm font-semibold">9/10</span>
                </div>
                <Progress value={90} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Excellent lighting and audio quality</p>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-sm">Key Strengths</h4>
                </div>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Excellent vocal variety and pacing</li>
                  <li>• Strong eye contact with camera</li>
                  <li>• Clear articulation and pronunciation</li>
                  <li>• Professional demeanor throughout</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                  <h4 className="font-semibold text-sm">Areas for Improvement</h4>
                </div>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Consider adding more specific examples</li>
                  <li>• Slightly improve background lighting</li>
                  <li>• Could mention classroom management style</li>
                </ul>
              </div>
            </div>

            {/* Recommended For */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Recommended Job Types</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Elementary</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Secondary</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">ESL</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">International Schools</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                Request Re-analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
