import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Smartphone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Security Settings',
  description: 'Manage your account security settings',
};

/**
 * MFA Implementation - Task 2.3
 * Multi-Factor Authentication settings page
 * TODO: Implement actual TOTP setup with otplib
 */
export default async function SecuritySettingsPage() {
  // TODO: Check if MFA is enabled for current user
  const mfaEnabled = false;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">Protect your account with two-factor authentication</p>
      </div>

      {/* MFA Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
              <CardDescription>
                {mfaEnabled
                  ? 'Your account is protected with 2FA'
                  : 'Add an extra layer of security to your account'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mfaEnabled ? (
            <>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm">
                  <strong>Recommended for ADMIN and SCHOOL accounts:</strong> Protect sensitive
                  data by requiring a verification code from your phone when signing in.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium">How it works:</p>
                </div>
                <ol className="text-sm text-muted-foreground space-y-1 ml-7">
                  <li>1. Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>2. Scan the QR code we provide</li>
                  <li>3. Enter the 6-digit code to verify setup</li>
                  <li>4. Save backup codes in a safe place</li>
                </ol>
              </div>

              <Button className="w-full">
                Enable Two-Factor Authentication
              </Button>
            </>
          ) : (
            <>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm">
                  <strong>2FA is active.</strong> Your account requires a verification code when
                  signing in from new devices.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  View Backup Codes
                </Button>
                <Button variant="destructive" className="flex-1">
                  Disable 2FA
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Additional Security Options */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Security</CardTitle>
          <CardDescription>Other ways to protect your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
            </div>
            <Button variant="outline">Change</Button>
          </div>
          <div className="flex items-center justify-between py-2 border-t">
            <div>
              <p className="font-medium">Active Sessions</p>
              <p className="text-sm text-muted-foreground">2 devices currently logged in</p>
            </div>
            <Button variant="outline">Manage</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
