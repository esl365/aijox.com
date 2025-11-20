import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy & Security Settings',
  description: 'Manage your privacy and security preferences',
};

export default async function PrivacySettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/settings/privacy');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-2">Privacy & Security</h1>
            <p className="text-muted-foreground">
              Control your privacy settings and security options
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Visibility</CardTitle>
            <CardDescription>
              Control who can see your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profilePublic" className="font-medium">
                  Public Profile
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Make your profile visible to all schools and recruiters
                </p>
              </div>
              <Switch id="profilePublic" defaultChecked={true} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showEmail" className="font-medium">
                  Show Email Address
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Display your email on your public profile
                </p>
              </div>
              <Switch id="showEmail" defaultChecked={false} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showPhone" className="font-medium">
                  Show Phone Number
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Display your phone number on your profile
                </p>
              </div>
              <Switch id="showPhone" defaultChecked={false} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search Engine Visibility</CardTitle>
            <CardDescription>
              Control whether search engines can find your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="searchEngines" className="font-medium">
                  Allow Search Engines
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Let search engines index your profile
                </p>
              </div>
              <Switch id="searchEngines" defaultChecked={true} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>
              Manage your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics" className="font-medium">
                  Analytics & Cookies
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Help us improve by sharing anonymous usage data
                </p>
              </div>
              <Switch id="analytics" defaultChecked={true} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="thirdParty" className="font-medium">
                  Third-party Data Sharing
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Share data with trusted partners for better service
                </p>
              </div>
              <Switch id="thirdParty" defaultChecked={false} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium">2FA Status</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication is currently disabled
                </p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Manage devices where you're currently logged in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Current Device</p>
                  <p className="text-sm text-muted-foreground">Last active: Just now</p>
                </div>
                <Button variant="outline" disabled>Active</Button>
              </div>
              <Button variant="destructive" className="w-full">
                Sign Out of All Other Devices
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Download Your Data</CardTitle>
            <CardDescription>
              Request a copy of your personal data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium mb-1">Data Export</p>
                <p className="text-sm text-muted-foreground">
                  Download all your data in a portable format
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Request Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
