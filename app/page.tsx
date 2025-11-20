import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Globe, Users, Briefcase, Sparkles, Search, Shield, Lock, CheckCircle, Menu } from 'lucide-react';
import { Footer } from '@/components/shared/footer';
import { prisma } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';

// SEO Optimization
export const metadata: Metadata = {
  title: 'Global Educator Nexus - International Teaching Jobs in Asia & Middle East',
  description: 'AI-powered platform matching qualified ESL/TEFL teachers with verified international schools. Find teaching jobs in South Korea, China, UAE, Japan, Singapore, Thailand, Vietnam & Malaysia. Free for teachers.',
  keywords: [
    'international teaching jobs',
    'teach abroad',
    'ESL jobs',
    'TEFL positions',
    'teach in Korea',
    'teach in China',
    'teach in UAE',
    'teach in Japan',
    'teach in Singapore',
    'international schools',
    'teaching jobs Asia',
    'teaching jobs Middle East',
    'AI teacher matching',
    'verified schools',
    'teaching abroad'
  ],
  authors: [{ name: 'Global Educator Nexus' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aijobx.vercel.app',
    siteName: 'Global Educator Nexus',
    title: 'Find Your Dream Teaching Job Abroad - AI-Powered Matching',
    description: '14+ verified international schools hiring now. Video analysis, smart matching, instant visa eligibility. Free for teachers.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@GlobalEduNexus',
    title: 'Global Educator Nexus - Teaching Jobs Abroad',
    description: 'AI-powered platform connecting teachers with international schools',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://aijobx.vercel.app',
  }
};

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  // Fetch real-time data
  const [recentJobs, stats, schools] = await Promise.all([
    prisma.jobPosting.findMany({
      where: { status: 'ACTIVE' },
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        schoolName: true,
        city: true,
        country: true,
        subject: true,
        salaryUSD: true,
        housingProvided: true,
        flightProvided: true,
        createdAt: true,
      }
    }),
    Promise.all([
      prisma.jobPosting.count({ where: { status: 'ACTIVE' } }),
      prisma.schoolProfile.count({ where: { isVerified: true } }),
      prisma.teacherProfile.count({ where: { status: 'ACTIVE' } }),
      prisma.jobPosting.groupBy({
        by: ['country'],
        where: { status: 'ACTIVE' },
        _count: { id: true }
      })
    ]).then(([jobs, schools, teachers, countries]) => ({
      jobs,
      schools,
      teachers,
      countries: countries.length
    })),
    prisma.schoolProfile.findMany({
      where: { isVerified: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        schoolName: true,
        city: true,
        country: true,
        schoolType: true,
      }
    })
  ]);

  const getSchoolEmoji = (type: string | null) => {
    if (!type) return '🏫';
    if (type.includes('British') || type.includes('IB')) return '🎓';
    return '🏫';
  };

  // Structured Data for SEO/GEO/AEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Global Educator Nexus",
    "url": "https://aijobx.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://aijobx.vercel.app/jobs?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What are the best countries to teach English abroad in 2025?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Based on our platform data of ${stats.jobs}+ active positions, the top countries for teaching English abroad are: 1) United Arab Emirates (Dubai) - $4,500-5,000/month with tax-free salary, 2) Singapore - $4,200-4,800/month with CPF benefits, 3) Japan (Tokyo) - $3,900-5,500/month, 4) South Korea (Seoul) - $2,800-3,500/month with housing, 5) China (Shanghai) - $3,800-4,200/month. All positions verified through our AI screening system.`
        }
      },
      {
        "@type": "Question",
        "name": "How much do international teachers make teaching abroad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "International teachers' salaries range from $2,400-5,500 USD per month depending on location, experience, and qualifications. Our platform shows: Entry-level ESL teachers (2-3 years): $2,400-3,200/month, Experienced teachers (5+ years): $3,500-4,500/month, IB/Specialized roles (7+ years): $4,800-5,500/month. Most positions include housing allowance, flight reimbursement, health insurance, and work visa sponsorship."
        }
      },
      {
        "@type": "Question",
        "name": "What qualifications do I need to teach English abroad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Requirements vary by country. Based on our verified job postings: Minimum: Bachelor's degree in any field + TEFL/TESOL certificate (120 hours), Preferred: Teaching license from home country + 2+ years experience, Highly Competitive: Master's in Education + subject-specific certification + 5+ years experience. Our AI video analysis tool helps you assess your readiness and provides personalized feedback."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with Mobile Navigation */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Global Educator Nexus</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/jobs">
              <Button variant="ghost">Find Jobs</Button>
            </Link>
            <Link href="/schools">
              <Button variant="ghost">Schools</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Find Your Dream <span className="text-primary">Teaching Job</span> Abroad
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-2">
              {stats.jobs} verified positions at {stats.schools} international schools across {stats.countries} countries
            </p>
            <p className="text-lg text-muted-foreground">
              AI-powered matching • Instant visa eligibility • Free for teachers
            </p>
          </div>

          {/* Prominent Search Bar */}
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
            <form action="/jobs" method="GET" className="space-y-4">
              <div className="grid md:grid-cols-[1fr_auto_auto] gap-4">
                <Input
                  type="text"
                  name="q"
                  placeholder="Job title, subject, or keyword..."
                  className="h-14 text-lg"
                />
                <Link href="/jobs">
                  <Button type="button" size="lg" className="h-14 w-full md:w-auto px-8">
                    <Search className="mr-2 h-5 w-5" />
                    Search Jobs
                  </Button>
                </Link>
              </div>

              {/* Quick Country Links */}
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-sm text-muted-foreground">Popular:</span>
                {['South Korea', 'China', 'UAE', 'Japan', 'Singapore'].map(country => (
                  <Link key={country} href={`/jobs?country=${encodeURIComponent(country)}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      {country}
                    </Badge>
                  </Link>
                ))}
              </div>
            </form>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <Link href="/signup?role=teacher">
              <Button size="lg" className="gap-2">
                <Users className="h-5 w-5" />
                I'm a Teacher
              </Button>
            </Link>
            <Link href="/signup?role=recruiter">
              <Button size="lg" variant="outline" className="gap-2">
                <Briefcase className="h-5 w-5" />
                I'm Hiring
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Schools Showcase */}
      <section className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wider">
            Trusted by Leading International Schools
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
            {schools.map(school => (
              <Link key={school.id} href={`/schools/${school.id}`} className="text-center hover:opacity-75 transition-opacity">
                <div className="text-5xl mb-3">{getSchoolEmoji(school.schoolType)}</div>
                <p className="text-sm font-medium line-clamp-2">{school.schoolName}</p>
                <p className="text-xs text-muted-foreground">{school.city}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Teaching Opportunities</h2>
            <p className="text-muted-foreground">Updated daily • All positions verified</p>
          </div>
          <Link href="/jobs" className="hidden md:block">
            <Button variant="outline" size="lg">
              View All {stats.jobs} Jobs →
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentJobs.map(job => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-1">
                  {job.schoolName} • {job.city}, {job.country}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ${job.salaryUSD.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                    <Badge variant="secondary">{job.subject}</Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {job.housingProvided && <Badge variant="outline" className="text-xs">🏠 Housing</Badge>}
                    {job.flightProvided && <Badge variant="outline" className="text-xs">✈️ Flight</Badge>}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/jobs/${job.id}`} className="w-full">
                  <Button className="w-full">View Details →</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link href="/jobs">
            <Button variant="outline" size="lg" className="w-full md:w-auto">
              View All {stats.jobs} Jobs →
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 mb-3" />
              <h3 className="font-semibold mb-1">100% Verified Schools</h3>
              <p className="text-sm opacity-90">All institutions background-checked</p>
            </div>
            <div className="flex flex-col items-center">
              <Lock className="h-12 w-12 mb-3" />
              <h3 className="font-semibold mb-1">Secure & Private</h3>
              <p className="text-sm opacity-90">Your data is encrypted and protected</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 mb-3" />
              <h3 className="font-semibold mb-1">100% Free for Teachers</h3>
              <p className="text-sm opacity-90">No hidden fees, ever</p>
            </div>
            <div className="flex flex-col items-center">
              <Sparkles className="h-12 w-12 mb-3" />
              <h3 className="font-semibold mb-1">AI-Powered Matching</h3>
              <p className="text-sm opacity-90">Smart recommendations just for you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">
          Why Choose Global Educator Nexus?
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-12">
          The only platform with AI-powered video analysis, autonomous matching, and instant visa validation
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold rounded-bl-lg">
              UNIQUE
            </div>
            <CardHeader>
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <CardTitle>AI Video Analysis</CardTitle>
              <CardDescription>
                Upload your teaching demonstration and receive instant AI-powered feedback on presentation skills, body language, and communication effectiveness. No other platform offers this.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/features">
                <Button variant="link" className="p-0">Learn how it works →</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold rounded-bl-lg">
              UNIQUE
            </div>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Autonomous Headhunter AI</CardTitle>
              <CardDescription>
                Our AI actively searches for perfect job matches and emails you personalized opportunities. You don't search for jobs – jobs find you.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/how-it-works">
                <Button variant="link" className="p-0">See how matching works →</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold rounded-bl-lg">
              UNIQUE
            </div>
            <CardHeader>
              <Globe className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Instant Visa Eligibility</CardTitle>
              <CardDescription>
                Know immediately which countries you can legally work in based on nationality, qualifications, age, and background. No more wasted applications.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/features">
                <Button variant="link" className="p-0">Check your eligibility →</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Real Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">{stats.countries}+</div>
              <div className="text-sm opacity-90">Countries</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{stats.jobs}</div>
              <div className="text-sm opacity-90">Active Jobs</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{stats.teachers}+</div>
              <div className="text-sm opacity-90">Teachers</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{stats.schools}</div>
              <div className="text-sm opacity-90">Verified Schools</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ for AEO */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left">
              How much do international teachers make teaching abroad?
            </AccordionTrigger>
            <AccordionContent className="text-base">
              Based on our {stats.jobs} current verified positions, international teachers earn $2,400-5,500 USD per month depending on location and experience. Entry-level ESL teachers (2-3 years) typically make $2,400-3,200/month, experienced teachers (5+ years) earn $3,500-4,500/month, and IB/specialized roles (7+ years) command $4,800-5,500/month. Most positions include housing, flights, health insurance, and visa sponsorship.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left">
              What are the best countries to teach English abroad in 2025?
            </AccordionTrigger>
            <AccordionContent className="text-base">
              Top countries based on our platform data: 1) UAE (Dubai) - $4,500-5,000/month tax-free, 2) Singapore - $4,200-4,800/month with CPF benefits, 3) Japan (Tokyo) - $3,900-5,500/month, 4) South Korea (Seoul) - $2,800-3,500/month with housing, 5) China (Shanghai) - $3,800-4,200/month. All positions are with verified international schools.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left">
              What qualifications do I need to teach English abroad?
            </AccordionTrigger>
            <AccordionContent className="text-base">
              Minimum: Bachelor's degree + TEFL/TESOL (120 hours). Preferred: Teaching license + 2+ years experience. Highly competitive: Master's in Education + 5+ years. Our AI video analysis tool helps assess your readiness and provides personalized feedback on your teaching skills.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left">
              How does the AI matching work?
            </AccordionTrigger>
            <AccordionContent className="text-base">
              Our AI analyzes your profile, qualifications, experience, and preferences to automatically match you with suitable positions. When schools post new jobs, our autonomous headhunter AI searches our teacher database and sends personalized email notifications to qualified candidates. You receive job recommendations tailored specifically to your profile.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left">
              Is the platform really free for teachers?
            </AccordionTrigger>
            <AccordionContent className="text-base">
              Yes! Global Educator Nexus is 100% free for teachers. There are no hidden fees, no subscription costs, and no charges for applying to jobs. Schools and recruiters pay to post positions and access our platform. Teachers get full access to all features including AI video analysis, job matching, and visa eligibility checking at no cost.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">Ready to Start Your Teaching Journey?</h2>
          <p className="text-xl text-muted-foreground">
            Join {stats.teachers}+ educators finding their dream teaching positions abroad.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup?role=teacher">
              <Button size="lg" className="text-lg px-8 py-6">
                Create Free Teacher Account
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Browse {stats.jobs} Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Structured Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Footer />
    </div>
  );
}
