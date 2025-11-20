import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'School Management',
  description: 'Manage school registrations',
};

export default async function AdminSchoolsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const schools = [
    { id: 1, name: 'Seoul International Academy', status: 'VERIFIED', jobs: 5, joined: '2024-12-01' },
    { id: 2, name: 'Tokyo Global School', status: 'PENDING', jobs: 0, joined: '2025-01-15' },
    { id: 3, name: 'Singapore American School', status: 'VERIFIED', jobs: 8, joined: '2024-11-20' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">School Management</h1>
          <p className="text-muted-foreground">Manage school registrations and verifications</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Search schools..." className="pl-10" />
        </div>

        <div className="space-y-4">
          {schools.map((school) => (
            <Card key={school.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{school.name}</h3>
                      <Badge variant={school.status === 'VERIFIED' ? 'default' : 'secondary'}>
                        {school.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>{school.jobs} active jobs</span>
                      <span className="mx-2">•</span>
                      <span>Joined {school.joined}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button>
                    {school.status === 'PENDING' && (
                      <>
                        <Button size="icon"><CheckCircle className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon"><XCircle className="h-4 w-4 text-red-500" /></Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
