import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Globe, Users, Briefcase, Sparkles, Shield, Lock, CheckCircle, GraduationCap } from 'lucide-react';
import { Footer } from '@/components/shared/footer';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/mobile/mobile-nav';
import {
  AnnouncementBar,
  HeroSection,
  SocialProofSection,
  ValuePropositionSection,
  TestimonialsSection,
  CTACardsSection,
  FeaturedBanner,
  BlogSection,
} from '@/components/home';
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

  // Social proof metrics
  const socialProofMetrics = [
    { value: stats.teachers || 10000, label: 'Teachers Matched', suffix: '+', icon: <Users className="h-6 w-6" /> },
    { value: stats.schools || 500, label: 'Partner Schools', suffix: '+', icon: <GraduationCap className="h-6 w-6" /> },
    { value: stats.countries || 50, label: 'Countries', suffix: '', icon: <Globe className="h-6 w-6" /> },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Announcement Bar */}
      <AnnouncementBar
        message="Introducing AI Video Analysis: Get instant feedback on your teaching demo"
        linkText="Try it now"
        linkHref="/dashboard/video"
        variant="gradient"
      />

      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 dark:bg-gray-950/95 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">Global Educator Nexus</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
              Find Jobs
            </Link>
            <Link href="/schools" className="text-sm font-medium hover:text-primary transition-colors">
              Schools
            </Link>
            <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">
              Blog
            </Link>
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-300">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-black text-white hover:bg-gray-800">Get Started</Button>
            </Link>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </header>

      {/* Hero Section - Wellfound style */}
      <HeroSection
        headline="Find your next"
        rotatingWords={[
          'teaching career',
          'dream school',
          'perfect match',
          'global adventure',
          'next opportunity',
        ]}
        subheadline="Connect with top international schools worldwide. AI-powered matching to find your perfect teaching position."
        primaryCTA={{ label: 'Browse Jobs', href: '/jobs' }}
        secondaryCTA={{ label: "I'm Hiring", href: '/recruiter' }}
      />

      {/* Social Proof Section */}
      <SocialProofSection
        metrics={socialProofMetrics}
        showLogos={true}
      />

      {/* Value Proposition Section */}
      <ValuePropositionSection
        teacherCard={{
          features: [
            'AI-powered job matching',
            'One-click applications',
            'Visa sponsorship filter',
            'Video demo analysis',
          ],
        }}
        recruiterCard={{
          features: [
            'Smart candidate matching',
            'Video screening insights',
            'Automated outreach',
            'Talent pipeline management',
          ],
        }}
      />

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
            <Card key={job.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">{job.title}</CardTitle>
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
                    {job.housingProvided && <Badge variant="outline" className="text-xs">Housing</Badge>}
                    {job.flightProvided && <Badge variant="outline" className="text-xs">Flight</Badge>}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/jobs/${job.id}`} className="w-full">
                  <Button className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">View Details →</Button>
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

      {/* Testimonials Section */}
      <TestimonialsSection autoplay={true} autoplayDelay={5000} />

      {/* CTA Cards Section */}
      <CTACardsSection />

      {/* Featured Banner */}
      <FeaturedBanner
        headline="10 out of 10"
        subheadline="teachers recommend Global Educator Nexus to their colleagues"
        cta={{ label: 'Join Today', href: '/signup' }}
        rating="4.9/5"
      />

      {/* Blog Section */}
      <BlogSection />

      {/* FAQ for AEO */}
      <section className="container mx-auto px-4 py-20 bg-white dark:bg-gray-950">
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
