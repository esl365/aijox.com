import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Footer } from '@/components/shared/footer';
import { ArrowLeft, MapPin, Star, Users, Globe, Building, DollarSign, Calendar, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'School Details',
  description: 'View school information and open positions',
};

export default async function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const school = {
    id: id,
    name: 'Seoul International Academy',
    location: 'Seoul, South Korea',
    type: 'International School',
    rating: 4.8,
    reviews: 127,
    teachers: 85,
    logo: '🏫',
    established: 2005,
    students: 650,
    curriculum: 'International Baccalaureate (IB)',
    openPositions: 5,
  };

  const openJobs = [
    { id: 1, title: 'ESL Teacher', grade: 'Elementary', salary: '$2,500-3,500', starts: 'August 2025' },
    { id: 2, title: 'Math Teacher', grade: 'Middle School', salary: '$3,000-4,000', starts: 'September 2025' },
    { id: 3, title: 'Science Teacher', grade: 'High School', salary: '$3,500-4,500', starts: 'August 2025' },
  ];

  const reviews = [
    { id: 1, author: 'John D.', rating: 5, date: '2025-01-10', text: 'Excellent school with supportive management and great facilities.' },
    { id: 2, author: 'Sarah M.', rating: 5, date: '2025-01-05', text: 'Professional environment, wonderful students, highly recommend!' },
    { id: 3, author: 'Michael K.', rating: 4, date: '2024-12-28', text: 'Good school overall, great location in Seoul.' },
  ];

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
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-foreground">{school.rating}</span>
                      <Link href={`/schools/${school.id}/reviews`} className="hover:underline">
                        ({school.reviews} reviews)
                      </Link>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">{school.type}</Badge>
                    <Badge variant="secondary">{school.curriculum}</Badge>
                    <Badge variant="default">{school.openPositions} Open Positions</Badge>
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
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <Building className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Established</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{school.established}</div>
                    <p className="text-sm text-muted-foreground">20 years of excellence</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{school.students}</div>
                    <p className="text-sm text-muted-foreground">Across all grades</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Teachers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{school.teachers}</div>
                    <p className="text-sm text-muted-foreground">Qualified professionals</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>About the School</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none">
                  <p>
                    Seoul International Academy is a leading international school offering the IB curriculum
                    to students from Pre-K through Grade 12. Our mission is to provide a world-class education
                    that prepares students for success in an increasingly global society.
                  </p>
                  <p>
                    We are committed to fostering academic excellence, cultural diversity, and personal growth
                    in a supportive and inclusive environment. Our experienced faculty comes from around the
                    world and brings a wealth of knowledge and expertise to the classroom.
                  </p>
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
              {openJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {job.grade}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}/month
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Starts {job.starts}
                          </div>
                        </div>
                      </div>
                      <Link href={`/jobs/${job.id}`}>
                        <Button>View Details</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Teacher Reviews</h3>
                  <p className="text-muted-foreground">Based on {school.reviews} verified reviews</p>
                </div>
                <Link href={`/schools/${school.id}/reviews`}>
                  <Button variant="outline">View All Reviews</Button>
                </Link>
              </div>

              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold">{review.author}</div>
                        <div className="text-sm text-muted-foreground">{review.date}</div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.text}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mission & Vision</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none">
                  <p>
                    <strong>Mission:</strong> To provide a world-class international education that develops
                    inquiring, knowledgeable, and caring young people who help create a better world through
                    intercultural understanding and respect.
                  </p>
                  <p>
                    <strong>Vision:</strong> To be the leading international school in Asia, recognized for
                    academic excellence, innovative teaching, and developing globally-minded citizens.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Facilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• State-of-the-art science laboratories</li>
                    <li>• Modern library and media center</li>
                    <li>• Olympic-size swimming pool</li>
                    <li>• Multi-purpose sports hall</li>
                    <li>• Music and art studios</li>
                    <li>• Technology-equipped classrooms</li>
                    <li>• Outdoor sports fields</li>
                    <li>• Cafeteria and dining facilities</li>
                  </ul>
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
