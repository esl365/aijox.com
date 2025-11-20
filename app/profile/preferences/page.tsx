import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, MapPin, DollarSign, Calendar, Bell, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Preferences',
  description: 'Set your job search preferences and notifications',
};

export default async function PreferencesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/profile/preferences');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-2">Preferences</h1>
            <p className="text-muted-foreground">Customize your job search and notification settings</p>
          </div>
        </div>

        {/* Location Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Preferences
            </CardTitle>
            <CardDescription>Select countries where you'd like to work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['South Korea', 'China', 'UAE', 'Vietnam', 'Thailand', 'Japan', 'Saudi Arabia', 'Taiwan', 'Singapore', 'Qatar'].map((country) => (
                <div key={country} className="flex items-center space-x-2">
                  <Checkbox id={country.toLowerCase().replace(' ', '-')} />
                  <label
                    htmlFor={country.toLowerCase().replace(' ', '-')}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {country}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Salary Expectations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Salary Expectations
            </CardTitle>
            <CardDescription>Set your desired salary range (monthly, USD)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-salary">Minimum Salary</Label>
                <Input id="min-salary" type="number" placeholder="2000" defaultValue="2500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-salary">Maximum Salary</Label>
                <Input id="max-salary" type="number" placeholder="5000" defaultValue="4500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Type Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Job Type Preferences
            </CardTitle>
            <CardDescription>What types of positions are you interested in?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-base">Grade Levels</Label>
                  {['Elementary (K-5)', 'Middle School (6-8)', 'High School (9-12)', 'University'].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox id={level.toLowerCase().replace(/[()]/g, '').replace(/ /g, '-')} />
                      <label
                        htmlFor={level.toLowerCase().replace(/[()]/g, '').replace(/ /g, '-')}
                        className="text-sm leading-none cursor-pointer"
                      >
                        {level}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Label className="text-base">School Types</Label>
                  {['International Schools', 'Public Schools', 'Private Schools', 'Language Centers'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox id={type.toLowerCase().replace(/ /g, '-')} />
                      <label
                        htmlFor={type.toLowerCase().replace(/ /g, '-')}
                        className="text-sm leading-none cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Subjects</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Math', 'Science', 'English', 'ESL', 'Social Studies', 'Arts', 'PE', 'Music'].map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox id={subject.toLowerCase()} />
                      <label
                        htmlFor={subject.toLowerCase()}
                        className="text-sm leading-none cursor-pointer"
                      >
                        {subject}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Availability
            </CardTitle>
            <CardDescription>When are you available to start?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">Immediately Available</Label>
                  <p className="text-sm text-muted-foreground">Can start within 2 weeks</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">Preferred Start Date</Label>
                <Input id="start-date" type="date" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose how you want to receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Job Match Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when new matching jobs are posted</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Application Updates</Label>
                <p className="text-sm text-muted-foreground">Updates on your job applications</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Messages</Label>
                <p className="text-sm text-muted-foreground">Direct messages from recruiters</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">Summary of new opportunities every week</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Tips, guides, and platform updates</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>Control your profile visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Public Profile</Label>
                <p className="text-sm text-muted-foreground">Make your profile visible to all recruiters</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Show Video Resume</Label>
                <p className="text-sm text-muted-foreground">Include video in profile previews</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Allow Direct Contact</Label>
                <p className="text-sm text-muted-foreground">Let recruiters message you directly</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button size="lg" className="flex-1">Save Preferences</Button>
          <Button size="lg" variant="outline">Reset to Defaults</Button>
        </div>
      </div>
    </div>
  );
}
