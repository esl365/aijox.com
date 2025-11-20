import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/shared/footer';
import { Search, MapPin, Star, Users, Globe, ArrowRight } from 'lucide-react';
import { getSchools, getSchoolStatsByCountry } from '@/app/actions/schools';

export const metadata: Metadata = {
  title: 'Schools Directory',
  description: 'Browse international schools and teaching institutions',
};

export default async function SchoolsPage() {
  const { schools: schoolsData, total } = await getSchools({}, 1, 50);
  const stats = await getSchoolStatsByCountry();

  // Map emoji based on school type
  const getSchoolEmoji = (type: string | null) => {
    if (!type) return '🏫';
    if (type.includes('British') || type.includes('British Curriculum')) return '🎓';
    if (type.includes('IB')) return '🎓';
    return '🏫';
  };

  const schools = schoolsData.map((school) => ({
    id: school.id,
    name: school.schoolName,
    location: `${school.city}, ${school.country}`,
    type: school.schoolType || 'International School',
    logo: getSchoolEmoji(school.schoolType),
    openPositions: school._count?.jobPostings || 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost">← Back to Home</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold">
            Discover <span className="text-primary">International Schools</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Browse verified schools and institutions hiring international teachers
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schools by name or location..."
                  className="pl-10"
                />
              </div>
              <Button size="lg">Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{total}+</div>
            <div className="text-sm text-muted-foreground">Schools</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{stats.length}+</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{schools.reduce((sum, s) => sum + s.openPositions, 0)}+</div>
            <div className="text-sm text-muted-foreground">Open Positions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">100%</div>
            <div className="text-sm text-muted-foreground">Verified</div>
          </div>
        </div>
      </section>

      {/* School List */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Schools</h2>
              <p className="text-muted-foreground">Top-rated institutions currently hiring</p>
            </div>
            <Button variant="outline">View All Filters</Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {schools.map((school) => (
              <Link key={school.id} href={`/schools/${school.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{school.logo}</div>
                      <div className="flex-1">
                        <CardTitle className="mb-2">{school.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mb-3">
                          <MapPin className="h-3 w-3" />
                          {school.location}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{school.type}</Badge>
                        {school.openPositions > 0 && (
                          <Badge variant="default">
                            {school.openPositions} Open Positions
                          </Badge>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Schools
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl space-y-6">
          <Globe className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Can't Find the Right School?</h2>
          <p className="text-lg opacity-90">
            Create a profile and let our AI match you with perfect opportunities
          </p>
          <Link href="/signup?role=teacher">
            <Button size="lg" variant="secondary">
              Create Teacher Profile
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
