import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { getEmailTemplates } from '@/app/actions/email-templates';
import { DeleteEmailTemplateButton } from '@/components/school/DeleteEmailTemplateButton';

export const metadata: Metadata = {
  title: 'Email Templates',
  description: 'Manage email templates for automated communications',
};

export default async function EmailTemplatesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/school/email-templates');
  }

  if (session.user.role !== 'SCHOOL' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const result = await getEmailTemplates();
  const templates = result.success ? result.templates : [];

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
            <h1 className="text-4xl font-bold mb-2">Email Templates</h1>
            <p className="text-muted-foreground">Create and manage personalized email templates</p>
          </div>
          <Link href="/school/email-templates/create">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create Template
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Email templates created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {templates.filter((t) => t.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently enabled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Default Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {templates.filter((t) => t.isDefault).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Set as default
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Template Types</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(templates.map((t) => t.templateType)).size}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique types
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Templates</CardTitle>
            <CardDescription>
              View and manage your email templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first email template for automated communications
                </p>
                <Link href="/school/email-templates/create">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Template
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="outline">{template.templateType}</Badge>
                        {template.isActive && (
                          <Badge variant="secondary">Active</Badge>
                        )}
                        {template.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                      </div>
                      <div className="mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Subject:</p>
                        <p className="text-sm">{template.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Preview:</p>
                        <p className="text-sm line-clamp-2">{template.body}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>
                          Created {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>
                          Updated {new Date(template.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/school/email-templates/${template.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteEmailTemplateButton templateId={template.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900">Personalization Tokens</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-purple-800 space-y-2">
            <p>Use these tokens in your templates to personalize messages:</p>
            <div className="grid md:grid-cols-3 gap-4 mt-3">
              <div>
                <p className="font-semibold mb-1">Candidate Tokens:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><code>{'{candidate.name}'}</code></li>
                  <li><code>{'{candidate.email}'}</code></li>
                  <li><code>{'{candidate.phone}'}</code></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">Job Tokens:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><code>{'{job.title}'}</code></li>
                  <li><code>{'{job.location}'}</code></li>
                  <li><code>{'{job.salary}'}</code></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">School Tokens:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><code>{'{school.name}'}</code></li>
                  <li><code>{'{school.city}'}</code></li>
                  <li><code>{'{school.country}'}</code></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
