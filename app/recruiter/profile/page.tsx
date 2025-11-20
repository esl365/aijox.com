import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Globe, Mail, Phone, Edit } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Recruiter Profile',
  description: 'Manage your recruiter profile',
};

export default async function RecruiterProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/recruiter/profile');
  }

  if (session.user.role !== 'RECRUITER') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Recruiter Profile</h1>
            <p className="text-muted-foreground">Manage your school/organization information</p>
          </div>
          <Link href="/recruiter/setup">
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="text-5xl">🏫</div>
              <div>
                <CardTitle className="text-2xl mb-1">Seoul International Academy</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Seoul, South Korea
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">School Information</h3>
              <dl className="grid md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">School Type</dt>
                  <dd className="font-medium">International School</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Curriculum</dt>
                  <dd className="font-medium">IB (International Baccalaureate)</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Number of Students</dt>
                  <dd className="font-medium">650</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Established</dt>
                  <dd className="font-medium">2005</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>hr@seoulacademy.edu</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+82 2 1234 5678</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href="https://seoulacademy.edu" className="text-primary hover:underline">
                    www.seoulacademy.edu
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Verification Status</h3>
              <div className="flex gap-2">
                <Badge variant="default">Email Verified</Badge>
                <Badge variant="default">School Verified</Badge>
                <Badge variant="secondary">Premium Member</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About the School</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Seoul International Academy is a leading international school offering the IB curriculum
              to students from Pre-K through Grade 12. We are committed to fostering academic excellence,
              cultural diversity, and personal growth in a supportive and inclusive environment.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">5</div>
                <div className="text-sm text-muted-foreground">Active Job Postings</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">144</div>
                <div className="text-sm text-muted-foreground">Total Applications</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">32</div>
                <div className="text-sm text-muted-foreground">Candidates Contacted</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
