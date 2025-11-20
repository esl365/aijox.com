import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Download, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Billing Settings',
  description: 'Manage your subscription and payment methods',
};

export default async function BillingSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/settings/billing');
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
            <h1 className="text-4xl font-bold mb-2">Billing & Subscription</h1>
            <p className="text-muted-foreground">
              Manage your subscription and payment methods
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              Your active subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold">Free Plan</h3>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-muted-foreground">
                  Access to basic features
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">$0</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Basic job search</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Up to 5 active applications</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Email support</span>
              </div>
            </div>

            <Button className="w-full" size="lg">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Premium Benefits</CardTitle>
            <CardDescription>
              Unlock all features with a premium subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-3">Monthly Plan</h4>
                <div className="text-3xl font-bold mb-2">$29</div>
                <p className="text-sm text-muted-foreground mb-4">per month</p>
                <Button variant="outline" className="w-full">Select Plan</Button>
              </div>
              <div className="border-2 border-primary rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">Annual Plan</h4>
                  <Badge>Save 20%</Badge>
                </div>
                <div className="text-3xl font-bold mb-2">$279</div>
                <p className="text-sm text-muted-foreground mb-4">per year ($23/month)</p>
                <Button className="w-full">Select Plan</Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium mb-3">Premium Features:</p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Unlimited job applications</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Advanced AI video analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Priority job matching</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Direct messaging with schools</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Resume builder and templates</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Priority customer support</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Manage your payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">No payment method added</p>
                  <p className="text-sm text-muted-foreground">
                    Add a card to subscribe to premium
                  </p>
                </div>
              </div>
              <Button variant="outline">Add Card</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View and download your invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No billing history yet</p>
              <p className="text-sm mt-1">Your invoices will appear here after purchase</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
