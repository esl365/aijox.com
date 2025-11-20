import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Footer } from '@/components/shared/footer';
import { ArrowLeft, MapPin, Star, Users, Globe, Building, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { getSchoolById } from '@/app/actions/schools';
import { getJobReviews, getJobReviewStats } from '@/app/actions/reviews';

export const metadata: Metadata = {
  title: 'School Details',
  description: 'View school information and open positions',
};

export default async function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const schoolData = await getSchoolById(id);

  if (!schoolData) {
    notFound();
  }

  const school = {
    id: schoolData.id,
    name: schoolData.schoolName,
    location: `${schoolData.city}, ${schoolData.country}`,
    type: schoolData.schoolType || 'International School',
    logo: schoolData.schoolType?.includes('British') || schoolData.schoolType?.includes('IB') ? '🎓' : '🏫',
    openPositions: schoolData._count?.jobPostings || 0,
    description: schoolData.description,
    website: schoolData.website,
    isVerified: schoolData.isVerified,
  };

  const openJobs = (schoolData.jobPostings || []).map((job) => ({
    id: job.id,
    title: job.title,
    subject: job.subject,
    salary: `$${job.salaryUSD.toLocaleString()}`,
    starts: job.startDate ? new Date(job.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'TBD',
    employmentType: job.employmentType,
    housingProvided: job.housingProvided,
    flightProvided: job.flightProvided,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/schools">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Schools
            </Button>
          </Link>
        </div>
      </header>

      {/* School Header */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <div className="text-6xl">{school.logo}</div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-3">{school.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {school.location}
                    </div>
                    {school.isVerified && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">{school.type}</Badge>
                    {school.openPositions > 0 && (
                      <Badge variant="default">{school.openPositions} Open Positions</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Link href={`/jobs?school=${school.id}`}>
                    <Button size="lg">View Open Positions</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="jobs">Open Positions</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About the School</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none">
                  {school.description ? (
                    <p>{school.description}</p>
                  ) : (
                    <p className="text-muted-foreground">No description available.</p>
                  )}
                  {school.website && (
                    <div className="mt-4">
                      <a
                        href={school.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        Visit School Website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Competitive Salary Package',
                      'Housing Allowance',
                      'Health Insurance',
                      'Flight Allowance',
                      'Professional Development',
                      'Visa Sponsorship',
                      'Pension Contribution',
                      'Summer & Winter Breaks',
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-4">
              {openJobs.length > 0 ? (
                openJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                          <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <Badge variant="outline">{job.subject}</Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salary}/month
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Starts {job.starts}
                            </div>
                            {job.housingProvided && (
                              <Badge variant="secondary">Housing</Badge>
                            )}
                            {job.flightProvided && (
                              <Badge variant="secondary">Flight</Badge>
                            )}
                          </div>
                        </div>
                        <Link href={`/jobs/${job.id}`}>
                          <Button>View Details</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>No open positions at this time.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <div className="py-12">
                    <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">Reviews Coming Soon</h3>
                    <p>Teacher reviews and ratings will be available here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>School Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Location</h4>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {school.location}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">School Type</h4>
                    <p className="text-muted-foreground">{school.type}</p>
                  </div>
                  {school.website && (
                    <div>
                      <h4 className="font-semibold mb-2">Website</h4>
                      <a
                        href={school.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        {school.website}
                      </a>
                    </div>
                  )}
                  {school.description && (
                    <div>
                      <h4 className="font-semibold mb-2">About</h4>
                      <p className="text-muted-foreground">{school.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
