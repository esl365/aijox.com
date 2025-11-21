import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, ArrowLeft, Power, PowerOff, Mail, Clock } from 'lucide-react';
import { getEmailAutomations, getEmailLogs } from '@/app/actions/email-automation';
import { ToggleAutomationButton } from '@/components/school/ToggleAutomationButton';
import { DeleteAutomationButton } from '@/components/school/DeleteAutomationButton';

export const metadata: Metadata = {
  title: 'Email Automation',
  description: 'Manage automated email workflows',
};

export default async function EmailAutomationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/school/email-automation');
  }

  if (session.user.role !== 'SCHOOL' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [automationsResult, logsResult] = await Promise.all([
    getEmailAutomations(),
    getEmailLogs(),
  ]);

  const automations = automationsResult.success ? automationsResult.automations : [];
  const logs = logsResult.success ? logsResult.logs : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/school/dashboard">
              <Button variant="ghost" size="sm" className="mb-2 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">Email Automation</h1>
            <p className="text-muted-foreground">Automate your candidate communications with triggers</p>
          </div>
          <Link href="/school/email-automation/create">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create Automation
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Automations</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{automations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Automation rules created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
              <Power className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {automations.filter((a) => a.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {automations.reduce((sum, a) => sum + a.sentCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Via automation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.length > 0
                  ? Math.round(
                      (logs.filter((l) => l.status === 'SENT').length / logs.length) * 100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Successful deliveries
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Automation Rules</CardTitle>
            <CardDescription>
              View and manage your automated email workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            {automations.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first automation to streamline candidate communications
                </p>
                <Link href="/school/email-automation/create">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Automation
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {automations.map((automation) => (
                  <div
                    key={automation.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{automation.name}</h3>
                        <Badge variant="outline">{automation.trigger}</Badge>
                        {automation.isActive ? (
                          <Badge variant="default" className="gap-1">
                            <Power className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <PowerOff className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                      {automation.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {automation.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-2 text-sm">
                        <span className="text-muted-foreground">Template:</span>
                        <span>{automation.template.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Sent: {automation.sentCount} emails</span>
                        {automation.delayMinutes > 0 && (
                          <>
                            <span>•</span>
                            <span>Delay: {automation.delayMinutes} minutes</span>
                          </>
                        )}
                        {automation.lastSentAt && (
                          <>
                            <span>•</span>
                            <span>
                              Last sent: {new Date(automation.lastSentAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ToggleAutomationButton
                        automationId={automation.id}
                        isActive={automation.isActive}
                      />
                      <DeleteAutomationButton automationId={automation.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Email Logs</CardTitle>
            <CardDescription>
              Track sent emails and delivery status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No emails sent yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded text-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.recipientEmail}</span>
                        {log.status === 'SENT' && (
                          <Badge variant="default" className="text-xs">Sent</Badge>
                        )}
                        {log.status === 'QUEUED' && (
                          <Badge variant="secondary" className="text-xs">Queued</Badge>
                        )}
                        {log.status === 'FAILED' && (
                          <Badge variant="destructive" className="text-xs">Failed</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{log.subject}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900">Automation Triggers Available</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-orange-800 space-y-2">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>NEW_APPLICATION:</strong> Trigger when a new application is received
              </li>
              <li>
                <strong>STATUS_CHANGE:</strong> Trigger when application status changes
              </li>
              <li>
                <strong>INTERVIEW_SCHEDULED:</strong> Trigger when an interview is scheduled
              </li>
              <li>
                <strong>OFFER_SENT:</strong> Trigger when a job offer is extended
              </li>
              <li>
                <strong>APPLICATION_REJECTED:</strong> Trigger when an application is rejected
              </li>
            </ul>
            <p className="pt-2">
              Set delays to send emails at the optimal time for engagement.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
