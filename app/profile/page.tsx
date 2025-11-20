import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, FileText, Settings, CheckCircle, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'View and edit your teacher profile',
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/profile');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your teaching profile and preferences</p>
          </div>
          <Link href="/profile/setup">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Profile Completion Banner */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Profile Completion</CardTitle>
                  <CardDescription>Complete your profile to increase visibility</CardDescription>
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">75%</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Basic Info
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Experience
              </Badge>
              <Badge variant="outline" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Video Resume
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Documents
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/profile/video">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Video className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Video Resume</CardTitle>
                <CardDescription>Upload and manage your teaching video</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Manage Video
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/documents">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Documents</CardTitle>
                <CardDescription>Upload certificates and credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Manage Documents
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/preferences">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Settings className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Set your job search preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Update Preferences
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Your current profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Name:</dt>
                    <dd className="font-medium">{session.user.name || 'Not set'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Email:</dt>
                    <dd className="font-medium">{session.user.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Role:</dt>
                    <dd><Badge>{session.user.role}</Badge></dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Professional Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subjects:</dt>
                    <dd className="font-medium">Math, Science</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Experience:</dt>
                    <dd className="font-medium">5+ years</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Certifications:</dt>
                    <dd className="font-medium">TEFL, BA Education</dd>
                  </div>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Profile updated</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Applied to ESL Teacher position in Seoul</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Video resume analyzed</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
