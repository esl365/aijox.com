import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notification Settings',
  description: 'Manage your notification preferences',
};

export default async function NotificationSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/settings/notifications');
  }

  const notificationSettings = {
    email: [
      { id: 'jobAlerts', label: 'Job Alerts', description: 'Receive emails for new job matches', defaultChecked: true },
      { id: 'applicationUpdates', label: 'Application Updates', description: 'Get notified about application status changes', defaultChecked: true },
      { id: 'messages', label: 'New Messages', description: 'Email notifications for new messages', defaultChecked: true },
      { id: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of your activity and new opportunities', defaultChecked: false },
      { id: 'marketingEmails', label: 'Marketing Emails', description: 'Promotional emails and product updates', defaultChecked: false },
    ],
    push: [
      { id: 'pushJobAlerts', label: 'Job Alerts', description: 'Push notifications for job matches', defaultChecked: true },
      { id: 'pushMessages', label: 'Messages', description: 'Push notifications for new messages', defaultChecked: true },
      { id: 'pushApplications', label: 'Applications', description: 'Updates on your applications', defaultChecked: true },
    ],
  };

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
            <h1 className="text-4xl font-bold mb-2">Notification Settings</h1>
            <p className="text-muted-foreground">
              Configure how you receive notifications
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Choose what email notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {notificationSettings.email.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Label htmlFor={setting.id} className="font-medium cursor-pointer">
                    {setting.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {setting.description}
                  </p>
                </div>
                <Switch id={setting.id} defaultChecked={setting.defaultChecked} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>
              Manage push notifications on your devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {notificationSettings.push.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Label htmlFor={setting.id} className="font-medium cursor-pointer">
                    {setting.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {setting.description}
                  </p>
                </div>
                <Switch id={setting.id} defaultChecked={setting.defaultChecked} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Frequency</CardTitle>
            <CardDescription>
              Control how often you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="instantNotifications" className="font-medium">
                  Instant Notifications
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive notifications as they happen
                </p>
              </div>
              <Switch id="instantNotifications" defaultChecked={true} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="batchNotifications" className="font-medium">
                  Batch Notifications
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Group notifications and send them once per day
                </p>
              </div>
              <Switch id="batchNotifications" defaultChecked={false} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>Save Preferences</Button>
        </div>
      </div>
    </div>
  );
}
