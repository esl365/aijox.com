import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Upload, Download, Trash2, CheckCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documents',
  description: 'Manage your credentials and certifications',
};

export default async function DocumentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/profile/documents');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  const documents = [
    { id: 1, name: 'Resume_JohnDoe.pdf', type: 'RESUME', status: 'verified', size: '245 KB', uploadedAt: '2025-01-15' },
    { id: 2, name: 'TEFL_Certificate.pdf', type: 'CERTIFICATION', status: 'verified', size: '1.2 MB', uploadedAt: '2025-01-10' },
    { id: 3, name: 'Bachelors_Degree.pdf', type: 'DEGREE', status: 'pending', size: '890 KB', uploadedAt: '2025-01-18' },
    { id: 4, name: 'Reference_Letter_1.pdf', type: 'REFERENCE', status: 'verified', size: '156 KB', uploadedAt: '2025-01-12' },
    { id: 5, name: 'Passport_Copy.pdf', type: 'PASSPORT', status: 'pending', size: '678 KB', uploadedAt: '2025-01-19' },
  ];

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
            <h1 className="text-4xl font-bold mb-2">Documents</h1>
            <p className="text-muted-foreground">Upload and manage your credentials</p>
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Document
            </CardTitle>
            <CardDescription>
              Upload certificates, degrees, references, or other credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="font-semibold mb-2">Drop files here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                PDF, JPG, PNG (Max 10MB per file)
              </p>
              <Button>Choose Files</Button>
            </div>
          </CardContent>
        </Card>

        {/* Document List */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
            <CardDescription>Your credentials and certifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 bg-blue-100 rounded flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        {doc.status === 'verified' ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>{doc.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>Uploaded {doc.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>Documents needed for complete verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-sm">Resume/CV</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Detailed work history and qualifications
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-sm">Teaching Certification</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  TEFL, TESOL, or equivalent certification
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <h4 className="font-semibold text-sm">Academic Degree</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Bachelor's degree or higher
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-sm">Reference Letters</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  At least 2 professional references
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <h4 className="font-semibold text-sm">Passport Copy</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Valid passport for visa processing
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <h4 className="font-semibold text-sm">Background Check</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Criminal background check (optional)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
